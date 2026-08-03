/**
 * The card, drawn again in canvas so it can be recorded.
 *
 * This is a deliberate second implementation of the same design rather than a
 * screenshot of the first. `foreignObject`-to-canvas cannot carry web fonts or
 * `backdrop-filter` reliably and is far too slow to feed a 30fps recorder, and
 * a screen capture would hand the visitor a video of their own browser chrome.
 * Drawing it directly is the only route to a clean, shareable file — and it
 * reads from the same `_timeline` clock as the DOM, so the two stay in step.
 */

import { formatCount, formatJoined, type XProfile } from "@/lib/x-profile";

import {
  clamp01,
  confettiAlpha,
  countAt,
  createConfetti,
  drawConfetti,
  easeOutExpo,
  intro,
  LAND_MS,
  placeAt,
  pop,
  TOTAL_MS,
  type Confetti,
} from "./_timeline";

/**
 * 16:9 landscape, holding one wide X profile.
 *
 * The counter is not a panel bolted onto the side of the card — it is the
 * profile's own follower stat, blown up. A profile with a second box for the
 * same number on it stops looking like a profile.
 */
export const WIDTH = 1600;
export const HEIGHT = 900;
const CARD_W = 1240;
const PAD_X = (WIDTH - CARD_W) / 2;
const RADIUS = 28;
const GUTTER = 56;
/** Full-width cover photo, a 6.4:1 slice of X's own 3:1 banner. */
const BANNER_H = 220;
const AVATAR = 156;
/** Bio measure. The full card width would run to a 60-word line. */
const BIO_W = 900;
/** The card is sized to its own content, so these are the bounds it lives in. */
const CARD_H_MAX = 800;

export const FPS = 30;

export type Colors = {
  bg: string;
  card: string;
  fg: string;
  muted: string;
  line: string;
  blue: string;
  shadow: string;
  /** False when the card is flush with the page — no fill, no drop shadow. */
  elevated: boolean;
};

export type Scene = {
  profile: XProfile;
  from: number;
  to: number;
  avatar: HTMLImageElement | null;
  banner: HTMLImageElement | null;
  colors: Colors;
  font: string;
  confetti: Confetti;
};

/**
 * Pulls the palette out of the live stylesheet instead of restating it, so the
 * video always matches the theme the visitor is actually looking at and the two
 * card implementations cannot drift apart on colour.
 */
export function readColors(card?: Element | null): Colors {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => {
    const value = style.getPropertyValue(name).trim();
    return value ? `rgb(${value.replace(/\s+/g, " ")})` : fallback;
  };

  const bg = read("--color-bg", "rgb(250 252 255)");

  // The card's own surface is read off the live element rather than off the
  // token, because a theme is allowed to flatten it — the light theme drops the
  // fill and the shadow so the card sits flush with the page. Reading the token
  // would put a white, floating card in a video of a flat one.
  const surface = card ? getComputedStyle(card).backgroundColor : "";
  const elevated = Boolean(surface) && !/^(transparent$|rgba\(.*,\s*0\s*\)$)/.test(surface);

  return {
    bg,
    card: elevated ? surface : bg,
    fg: read("--ui-demo-fg", "rgb(15 20 25)"),
    muted: read("--ui-demo-muted", "rgb(83 100 113)"),
    line: read("--ui-demo-line", "rgb(230 236 240)"),
    blue: "rgb(29 155 240)",
    shadow: read("--ui-demo-shadow", "rgb(15 20 25)"),
    elevated,
  };
}

/** `crossOrigin` is the whole point: without it the canvas taints and the export dies. */
export function loadImage(url: string | null): Promise<HTMLImageElement | null> {
  if (!url) return Promise.resolve(null);

  return new Promise((resolve) => {
    const img = new Image();

    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * The tokens are space-separated (`rgb(29 155 240)`), so the channels have to be
 * pulled out and recombined — splicing an alpha onto the end would produce
 * `rgba(29 155 240, 0.12)`, which mixes both syntaxes and is rejected outright
 * by the canvas colour parser.
 */
function withAlpha(color: string, alpha: number) {
  const channels = color.match(/\d*\.?\d+/g);

  return channels && channels.length >= 3
    ? `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${alpha})`
    : color;
}

/** `object-fit: cover`, as a source rectangle. */
function cover(img: HTMLImageElement, w: number, h: number) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;

  return [(img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh] as const;
}

function setFont(ctx: CanvasRenderingContext2D, scene: Scene, weight: number, size: number) {
  ctx.font = `${weight} ${size}px ${scene.font}`;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const lines: string[] = [];
  let line = "";

  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;

    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
      continue;
    }

    lines.push(line);
    line = word;

    if (lines.length === maxLines) break;
  }

  if (lines.length < maxLines && line) lines.push(line);

  // Trim the last line back until the ellipsis fits, rather than letting it
  // overhang the card edge.
  if (lines.length === maxLines) {
    let last = lines[maxLines - 1]!;
    const overflowed = text.length > lines.join(" ").length;

    if (overflowed) {
      while (last && ctx.measureText(`${last}…`).width > maxWidth) {
        last = last.slice(0, -1);
      }

      lines[maxLines - 1] = `${last.trimEnd()}…`;
    }
  }

  return lines;
}

/**
 * The rolling counter: each place slides its digit up with the next arriving
 * from below. See `placeAt` for the mechanism the digits follow.
 */
function drawOdometer(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  value: number,
  centerX: number,
  baseline: number,
  size: number,
  ambient: number,
) {
  // Measured, not assumed: the variable face has no guaranteed tabular figures,
  // so a fixed cell keeps the number from jittering as digits change.
  const { cell, comma: commaW } = digitMetrics(ctx, scene, size);
  const places = Math.max(String(Math.floor(Math.max(scene.to, scene.from))).length, 1);

  // The window is measured off the glyph box, not guessed from the font size.
  // Window and travel have to be the same height: any slack and two digits sit
  // fully visible at once, which reads as a broken number rather than a wheel.
  const metrics = ctx.measureText("0");
  const pad = size * 0.05;
  const travel = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + pad * 2;
  const top = baseline - metrics.actualBoundingBoxAscent - pad;

  let width = places * cell;
  for (let i = 1; i < places; i += 1) if (i % 3 === 0) width += commaW;

  let x = centerX - width / 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  for (let i = 0; i < places; i += 1) {
    const place = places - 1 - i;
    const { digit, roll, alpha } = placeAt(value, place);

    if (alpha > 0) {
      ctx.save();
      ctx.globalAlpha = ambient * alpha;
      ctx.beginPath();
      ctx.rect(x, top, cell, travel);
      ctx.clip();
      ctx.fillStyle = scene.colors.fg;
      ctx.fillText(String(digit), x + cell / 2, baseline - roll * travel);
      ctx.fillText(String((digit + 1) % 10), x + cell / 2, baseline + travel - roll * travel);
      ctx.restore();
    }

    x += cell;

    if (place > 0 && place % 3 === 0) {
      // The separator belongs to the group on its left, so it appears with it.
      ctx.save();
      ctx.globalAlpha = ambient * alpha;
      ctx.fillStyle = scene.colors.fg;
      ctx.textAlign = "left";
      ctx.fillText(",", x, baseline);
      ctx.restore();
      ctx.textAlign = "center";
      x += commaW;
    }
  }
}

function drawVerified(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, blue: string) {
  const s = size / 24;

  ctx.save();
  ctx.translate(x, y - size);
  ctx.scale(s, s);
  ctx.fillStyle = blue;

  const badge = new Path2D(
    "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",
  );
  ctx.fill(badge);

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2.1;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke(new Path2D("m8.7 12.1 2.2 2.2 4.4-4.6"));
  ctx.restore();
}

type CardLayout = ReturnType<typeof layoutCard>;

/** The widest a digit gets in the current font, plus the separator width. */
function digitMetrics(ctx: CanvasRenderingContext2D, scene: Scene, size: number) {
  setFont(ctx, scene, 700, size);

  let cell = 0;
  for (let d = 0; d < 10; d += 1) cell = Math.max(cell, ctx.measureText(String(d)).width);

  return { cell, comma: ctx.measureText(",").width };
}

/**
 * Every position on the card, resolved in one pass.
 *
 * The stack is a profile's own: cover photo, avatar straddling its edge, then
 * name, handle, bio, the joined/location line, and the stats row. The only
 * liberty taken is the size of the follower count in that stats row — it is the
 * thing the video exists to land, so it is the thing that is big.
 *
 * The card height falls out of the content rather than being fixed. A fixed
 * height leaves a bio-less profile sitting above a lake of empty card, which is
 * the one thing a landscape frame cannot hide.
 */
function layoutCard(ctx: CanvasRenderingContext2D, scene: Scene) {
  const { profile } = scene;

  setFont(ctx, scene, 400, 25);
  const bio = profile.bio ? wrap(ctx, profile.bio, BIO_W, 3) : [];
  const meta = [profile.location, profile.createdAt ? `Joined ${formatJoined(profile.createdAt)}` : null]
    .filter(Boolean)
    .join("   ·   ");

  /* --------------------------------------------------------- identity stack -- */

  const avatarY = BANNER_H - AVATAR * 0.55;

  let y = avatarY + AVATAR + 58;
  const nameY = y;

  y += 38;
  const handleY = y;

  if (bio.length) y += 52;
  const bioY = y;
  if (bio.length) y += (bio.length - 1) * 35;

  if (meta) y += 46;
  const metaY = y;

  /* ------------------------------------------------------------- stats row -- */

  // Nine digits and two separators is far wider than three, so the count is
  // fitted to the space the row can actually give it rather than trusting one
  // size to work for every milestone.
  const places = Math.max(String(Math.floor(Math.max(scene.to, scene.from))).length, 1);
  const separators = Math.floor((places - 1) / 3);
  const base = digitMetrics(ctx, scene, 100);
  const naturalW = places * base.cell + separators * base.comma;
  const numberSize = Math.min(100, Math.floor((100 * 620) / naturalW));

  const metrics = digitMetrics(ctx, scene, numberSize);
  const numberW = places * metrics.cell + separators * metrics.comma;

  // Following comes first, then the animated Followers — same order the DOM
  // card uses, so the row reads the same regardless of which surface it lives on.
  const followingStr = formatCount(profile.following);
  setFont(ctx, scene, 650, 28);
  const followingCountW = ctx.measureText(followingStr).width;
  setFont(ctx, scene, 400, 26);
  const followingLabelW = ctx.measureText("Following").width;
  const followingBlockW = followingCountW + 10 + followingLabelW;

  const numberStartX = GUTTER + followingBlockW + 48;

  const statsY = metaY + 120;
  const cardH = Math.min(statsY + 58, CARD_H_MAX);

  return {
    bio,
    meta,
    cardH,
    padY: Math.round((HEIGHT - cardH) / 2),
    avatarY,
    nameY,
    handleY,
    bioY,
    metaY,
    numberSize,
    numberW,
    followingStr,
    followingCountW,
    followingLabelW,
    /** Centre of the counter, for the kick pivot and the confetti origin. */
    numberX: numberStartX + numberW / 2,
    numberStartX,
    statsY,
    hasChip: scene.to - scene.from > 0,
  };
}

function drawCard(ctx: CanvasRenderingContext2D, scene: Scene, t: number, layout: CardLayout) {
  const { colors, profile } = scene;
  // Canvas `globalAlpha` replaces rather than multiplies, so the entrance fade
  // has to be threaded through every nested `save()` by hand — otherwise the
  // counter and the chip ignore it and sit fully opaque over an invisible card.
  const ambient = ctx.globalAlpha;

  ctx.save();
  ctx.translate(PAD_X, layout.padY);

  // Depth: a soft drop shadow keeps the card off the backdrop without a border
  // doing the work. Drawn on the clip path, then cleared before the contents.
  ctx.save();

  if (colors.elevated) {
    ctx.shadowColor = withAlpha(colors.shadow, 0.14);
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 24;
  }

  ctx.fillStyle = colors.card;
  ctx.beginPath();
  ctx.roundRect(0, 0, CARD_W, layout.cardH, RADIUS);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, CARD_W, layout.cardH, RADIUS);
  ctx.clip();

  // Full width, as it is on a profile. Cropping it to one column left the other
  // column starting on bare card and the banner reading as a stray swatch.
  if (scene.banner) {
    ctx.drawImage(scene.banner, ...cover(scene.banner, CARD_W, BANNER_H), 0, 0, CARD_W, BANNER_H);
  } else {
    ctx.fillStyle = withAlpha(colors.muted, 0.12);
    ctx.fillRect(0, 0, CARD_W, BANNER_H);
  }

  // A pale banner is otherwise indistinguishable from the card under it, which
  // leaves whatever the banner happens to contain floating in the layout.
  ctx.fillStyle = colors.line;
  ctx.fillRect(0, BANNER_H - 1, CARD_W, 1);

  ctx.restore();

  // Avatar, straddling the banner edge with a ring in the card colour.
  const avatarX = GUTTER;
  const cx = avatarX + AVATAR / 2;
  const cy = layout.avatarY + AVATAR / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, AVATAR / 2 + 6, 0, Math.PI * 2);
  ctx.fillStyle = colors.card;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, AVATAR / 2, 0, Math.PI * 2);
  ctx.clip();

  if (scene.avatar) {
    ctx.drawImage(scene.avatar, ...cover(scene.avatar, AVATAR, AVATAR), avatarX, layout.avatarY, AVATAR, AVATAR);
  } else {
    ctx.fillStyle = withAlpha(colors.muted, 0.25);
    ctx.fillRect(avatarX, layout.avatarY, AVATAR, AVATAR);
    setFont(ctx, scene, 600, 64);
    ctx.fillStyle = colors.fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(profile.name.slice(0, 1).toUpperCase(), cx, cy + 4);
  }

  ctx.restore();

  /* ------------------------------------------------------------- identity -- */

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  setFont(ctx, scene, 650, 46);
  ctx.fillStyle = colors.fg;
  ctx.fillText(profile.name, GUTTER, layout.nameY);

  if (profile.isVerified) {
    drawVerified(
      ctx,
      GUTTER + ctx.measureText(profile.name).width + 14,
      layout.nameY,
      34,
      colors.blue,
    );
  }

  setFont(ctx, scene, 400, 26);
  ctx.fillStyle = colors.muted;
  ctx.fillText(`@${profile.username}`, GUTTER, layout.handleY);

  setFont(ctx, scene, 400, 25);
  ctx.fillStyle = colors.fg;
  layout.bio.forEach((line, i) => ctx.fillText(line, GUTTER, layout.bioY + i * 35));

  if (layout.meta) {
    setFont(ctx, scene, 400, 22);
    ctx.fillStyle = colors.muted;
    ctx.fillText(layout.meta, GUTTER, layout.metaY);
  }

  // Where the Follow button sits on a real profile. Nothing else on the card
  // wants that corner, and leaving it empty is what made the top right read as
  // a gap rather than a margin.
  setFont(ctx, scene, 500, 21);
  const markW = ctx.measureText("hanu.sh/celebrate").width + 52;
  const markY = BANNER_H + 44;

  ctx.strokeStyle = withAlpha(colors.muted, 0.32);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(CARD_W - GUTTER - markW, markY - 27, markW, 54, 27);
  ctx.stroke();

  ctx.fillStyle = colors.muted;
  ctx.textAlign = "center";
  ctx.fillText("hanu.sh/celebrate", CARD_W - GUTTER - markW / 2, markY + 8);

  /* ------------------------------------------------------------ stats row -- */

  // Following left, then the animated Followers — same order as the DOM card.
  // They share a baseline so the oversized count reads as one stat among others
  // rather than as a headline sitting above a profile.
  ctx.textAlign = "left";
  let x = GUTTER;

  setFont(ctx, scene, 650, 28);
  ctx.fillStyle = colors.fg;
  ctx.fillText(layout.followingStr, x, layout.statsY);
  x += layout.followingCountW + 10;

  setFont(ctx, scene, 400, 26);
  ctx.fillStyle = colors.muted;
  ctx.fillText("Following", x, layout.statsY);

  const value = countAt(t, scene.from, scene.to);
  const landed = t - LAND_MS;
  const kick = 1 + pop(landed) * 0.055;
  const pivotY = layout.statsY - layout.numberSize * 0.34;

  ctx.save();
  ctx.translate(layout.numberX, pivotY);
  ctx.scale(kick, kick);
  ctx.translate(-layout.numberX, -pivotY);

  drawOdometer(ctx, scene, value, layout.numberX, layout.statsY, layout.numberSize, ambient);
  ctx.restore();

  setFont(ctx, scene, 400, 26);
  ctx.fillStyle = colors.muted;
  ctx.textAlign = "left";
  ctx.fillText("Followers", layout.numberStartX + layout.numberW + 12, layout.statsY);

  if (layout.hasChip) {
    const chipIn = easeOutExpo(clamp01(landed / 520));

    ctx.save();
    ctx.globalAlpha = ambient * chipIn;
    setFont(ctx, scene, 600, 25);

    const label = `+${formatCount(scene.to - scene.from)} new followers`;
    const w = ctx.measureText(label).width + 44;
    const chipY = layout.statsY - 12 + (1 - chipIn) * 14;

    ctx.fillStyle = withAlpha(colors.blue, 0.12);
    ctx.beginPath();
    ctx.roundRect(CARD_W - GUTTER - w, chipY - 32, w, 48, 24);
    ctx.fill();

    ctx.fillStyle = colors.blue;
    ctx.textAlign = "center";
    ctx.fillText(label, CARD_W - GUTTER - w / 2, chipY);
    ctx.restore();
  }

  // The ring goes on last so it sits over the banner, exactly as the DOM ring
  // does — and it is the only thing holding the card's edge when the theme has
  // flattened the surface into the page, so it needs to be visible enough to
  // hold that edge on its own.
  ctx.strokeStyle = colors.elevated ? colors.line : withAlpha(colors.fg, 0.14);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(0.5, 0.5, CARD_W - 1, layout.cardH - 1, RADIUS);
  ctx.stroke();

  ctx.restore();
}

/** One full frame of the export, backdrop and confetti included. */
export function renderFrame(ctx: CanvasRenderingContext2D, scene: Scene, t: number) {
  const { colors } = scene;

  // Flat page background, no glow layered over it — the live component sits on
  // the plain page bg, and the video is supposed to match what's on screen.
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const enter = intro(t);

  ctx.save();
  ctx.globalAlpha = enter;
  ctx.translate(WIDTH / 2, HEIGHT / 2);
  // Settles from slightly small, never from nothing.
  ctx.scale(0.96 + enter * 0.04, 0.96 + enter * 0.04);
  ctx.translate(-WIDTH / 2, -HEIGHT / 2);
  drawCard(ctx, scene, t, layoutCard(ctx, scene));
  ctx.restore();

  if (t >= LAND_MS) {
    const since = t - LAND_MS;
    scene.confetti.seek(since);
    drawConfetti(ctx, scene.confetti, HEIGHT, confettiAlpha(since));
  }
}

const MIME_TYPES = [
  // mp4 first: it is the only one of these that can be dropped straight into a
  // post. webm is the fallback for browsers that will not mux h264.
  "video/mp4;codecs=avc1.4d002a,mp4a.40.2",
  "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
  "video/mp4",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

export function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return null;
  return MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? null;
}

export function buildScene(
  profile: XProfile,
  from: number,
  to: number,
  avatar: HTMLImageElement | null,
  banner: HTMLImageElement | null,
  seed: number,
  card?: Element | null,
): Scene {
  const scene: Scene = {
    profile,
    from,
    to,
    avatar,
    banner,
    colors: readColors(card),
    font: getComputedStyle(document.body).fontFamily || "system-ui, sans-serif",
    // Replaced below. The origin is a measured position on the card, and the
    // card cannot be measured without a scene to measure it against.
    confetti: createConfetti(WIDTH, HEIGHT, WIDTH / 2, HEIGHT / 2, seed),
  };

  // Fired at the height the counter lands at, but from the middle of the frame
  // rather than from the counter itself. The stat row sits low and hard left on
  // a profile, and a cannon fired from there throws half the burst off the two
  // nearest edges.
  const probe = document.createElement("canvas").getContext("2d");

  if (probe) {
    const layout = layoutCard(probe, scene);

    scene.confetti = createConfetti(
      WIDTH,
      HEIGHT,
      WIDTH / 2,
      layout.padY + layout.statsY - layout.numberSize * 0.34,
      seed,
    );
  }

  return scene;
}

/**
 * Records the timeline in real time.
 *
 * `captureStream` only emits frames the canvas actually paints, so the run has
 * to happen at wall-clock speed — there is no faster path that keeps the audio.
 * The audio is scheduled into a `MediaStreamAudioDestinationNode` and its track
 * is added to the same stream, which is what gets the sound into the file
 * rather than alongside it.
 */
export async function recordCelebration(
  scene: Scene,
  schedule: (ctx: AudioContext, destination: AudioNode, at: number) => void,
  onProgress: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<Blob> {
  const mimeType = pickMimeType();
  if (!mimeType) throw new Error("recording_unsupported");
  if (document.hidden) throw new Error("recording_interrupted");

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("canvas_unavailable");

  // Paint frame zero before the stream starts, so the file never opens on blank.
  scene.confetti.seek(0);
  renderFrame(ctx, scene, 0);

  const stream = canvas.captureStream(FPS);
  const audio = new AudioContext();
  const destination = audio.createMediaStreamDestination();

  await audio.resume();
  for (const track of destination.stream.getAudioTracks()) stream.addTrack(track);

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 12_000_000,
    audioBitsPerSecond: 128_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };

  const done = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    recorder.onerror = () => reject(new Error("recording_failed"));
  });

  recorder.start();
  schedule(audio, destination, audio.currentTime + 0.08);

  const started = performance.now();

  try {
    await new Promise<void>((resolve, reject) => {
      let handle = 0;

      const cleanup = () => {
        document.removeEventListener("visibilitychange", onVisibility);
        cancelAnimationFrame(handle);
      };

      // `requestAnimationFrame` does not fire in a background tab, but the
      // recorder keeps writing wall-clock time regardless — so a visitor who
      // switches tabs would get a file that is one frozen frame with a full
      // soundtrack over it. There is no way to render ahead of real time with
      // audio attached, so the only honest move is to stop and say so.
      const onVisibility = () => {
        if (!document.hidden) return;
        cleanup();
        reject(new Error("recording_interrupted"));
      };

      const frame = () => {
        const t = performance.now() - started;

        if (signal?.aborted || t >= TOTAL_MS) {
          // Hold the final frame so the video does not cut on the same instant
          // it resolves — an abrupt last frame reads as a dropped file.
          renderFrame(ctx, scene, TOTAL_MS);
          cleanup();
          resolve();
          return;
        }

        renderFrame(ctx, scene, t);
        onProgress(clamp01(t / TOTAL_MS));
        handle = requestAnimationFrame(frame);
      };

      document.addEventListener("visibilitychange", onVisibility);
      handle = requestAnimationFrame(frame);
    });

    // One extra beat of the held frame before stopping — otherwise the muxer
    // trims the tail and the confetti appears to vanish mid-fall.
    await new Promise((resolve) => setTimeout(resolve, 260));

    recorder.stop();

    const blob = await done;
    onProgress(1);
    return blob;
  } finally {
    if (recorder.state !== "inactive") recorder.stop();
    stream.getTracks().forEach((track) => track.stop());
    await audio.close();
  }
}

export function extensionFor(mimeType: string) {
  return mimeType.includes("mp4") ? "mp4" : "webm";
}
