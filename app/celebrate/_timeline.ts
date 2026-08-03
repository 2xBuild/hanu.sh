/**
 * The single clock behind the celebration.
 *
 * Two renderers read from here — the DOM stage on screen and the offscreen
 * canvas that gets muxed into the downloadable video — so every value that
 * either one animates has to be a pure function of elapsed milliseconds. That
 * is what keeps the download honest: it is the same run, not a lookalike.
 */

/** Card settles before the number starts moving, so the count has a stage. */
export const INTRO_MS = 420;
export const COUNT_MS = 4200;
/** The frame the number lands and the confetti fires. */
export const LAND_MS = INTRO_MS + COUNT_MS;
export const OUTRO_MS = 3300;
export const TOTAL_MS = LAND_MS + OUTRO_MS;

/** Confetti is authored against this canvas height and scaled from it. */
const REFERENCE_H = 900;

export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Fast off the line, long decelerating landing. The count spends its last
 * second crawling through the final few numbers, which is where the tension is
 * — an even, linear count arrives without ever feeling like it arrived.
 */
const easeOutQuart = (p: number) => 1 - (1 - p) ** 4;

/** Entrances only: strong ease-out, the curve the rest of the site uses. */
export const easeOutExpo = (p: number) => (p >= 1 ? 1 : 1 - 2 ** (-10 * p));

/**
 * The follower count at `t` — fractional on purpose, so the ones place can roll
 * between integers instead of snapping. Exact at both ends.
 */
export function countAt(t: number, from: number, to: number) {
  const p = clamp01((t - INTRO_MS) / COUNT_MS);
  return p >= 1 ? to : from + (to - from) * easeOutQuart(p);
}

/**
 * One place of the counter: which digit it shows, how far it has turned towards
 * the next one, and whether it is significant yet.
 *
 * The turnover window is the whole trick. A geared odometer really does sit its
 * hundreds wheel 93% of the way to 4 when it reads 393 — true to the mechanism,
 * and wrong for a number, which has to *land*. So a place only turns during the
 * final `1 / magnitude` of its own cycle, which is exactly the stretch where
 * the place below it wraps from 9 to 0. The ones place has a magnitude of one,
 * so its whole cycle is turnover and it rolls continuously.
 */
export function placeAt(value: number, place: number) {
  const magnitude = 10 ** place;
  const scaled = value / magnitude;
  const whole = Math.floor(scaled);
  const turnover = 1 / magnitude;

  return {
    digit: ((whole % 10) + 10) % 10,
    roll: clamp01((scaled - whole - 1 + turnover) / turnover),
    // Leading zeros fade in across the last stretch before their place becomes
    // significant, so a new digit arrives rolling rather than appearing.
    alpha: place === 0 ? 1 : clamp01((scaled - 0.85) / 0.15),
  };
}

export const isCounting = (t: number) => t >= INTRO_MS && t < LAND_MS;

/**
 * A decaying oscillation, not a duration-based curve: the number is being
 * struck, so it should overshoot once and settle rather than glide to a stop.
 * Peaks around +0.35 shortly after the hit and is inaudible by ~600ms.
 */
export function pop(t: number) {
  if (t < 0) return 0;

  const s = t / 1000;
  return Math.exp(-s * 9) * Math.sin(s * 26);
}

/** Card entrance, 0 → 1 over the intro. */
export const intro = (t: number) => easeOutExpo(clamp01(t / INTRO_MS));

/**
 * Deterministic PRNG (mulberry32). Seeding the burst means the confetti in the
 * downloaded file falls exactly the way it fell on screen — replaying the same
 * celebration, rather than rolling a second one.
 */
export function rng(seed: number) {
  let a = seed >>> 0;

  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Saturated enough to read on both themes; none of them is pure white or black. */
const COLORS = ["#1d9bf0", "#f7b32b", "#ff5c8a", "#2fd694", "#a78bfa", "#ff8a3d"];

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Ribbon half-width and half-height in px. */
  w: number;
  h: number;
  color: string;
  /** Spin phase and rate — a flat ribbon tumbling edge-on reads as 3D. */
  spin: number;
  spinRate: number;
  tilt: number;
  tiltRate: number;
  /** Seconds before this particle starts falling. */
  delay: number;
  life: number;
};

export type Confetti = {
  particles: Particle[];
  /** Advance the simulation to `t` ms after the burst. Safe to call in any order. */
  seek: (t: number) => void;
};

/**
 * Tuned at the reference height. Terminal velocity is the number that matters:
 * paper flutters down, it does not drop. Left to gravity alone the burst clears
 * the frame in under a second and the celebration is over before it registers.
 */
const GRAVITY = 1500;
/** px/s of fall the ribbons settle to, once drag balances gravity. */
const TERMINAL = 320;
/** Sideways speed bleeds off far faster than fall speed, so the cone collapses. */
const SIDE_DRAG = 1.7;

/**
 * A burst from behind the counter plus a slower fall from above the frame. The
 * two arrivals overlap, so the screen never has a single empty moment between
 * "the number landed" and "the confetti is falling".
 */
export function createConfetti(
  width: number,
  height: number,
  originX: number,
  originY: number,
  seed: number,
): Confetti {
  const random = rng(seed);
  const scale = height / REFERENCE_H;
  const particles: Particle[] = [];

  const add = (p: Particle) => particles.push(p);

  // Cannon: radial, biased upward, wide speed spread so it opens into a cone
  // rather than a ring.
  for (let i = 0; i < 96; i += 1) {
    const angle = -Math.PI / 2 + (random() - 0.5) * 2.3;
    // Fast enough to read as a cannon, slow enough that most of the cone stays
    // inside the frame instead of firing out the top and falling back in.
    const speed = (360 + random() * 620) * scale;

    add({
      x: originX + (random() - 0.5) * 40 * scale,
      y: originY,
      vx: Math.cos(angle) * speed * 1.25,
      vy: Math.sin(angle) * speed,
      w: (5 + random() * 5) * scale,
      h: (8 + random() * 7) * scale,
      color: COLORS[Math.floor(random() * COLORS.length)]!,
      spin: random() * Math.PI * 2,
      spinRate: (random() - 0.5) * 22,
      tilt: random() * Math.PI * 2,
      tiltRate: 4 + random() * 9,
      delay: random() * 0.06,
      life: 0,
    });
  }

  // Rain: enters from above the frame a beat later, so the celebration keeps
  // going after the cannon has spent itself.
  for (let i = 0; i < 46; i += 1) {
    add({
      x: random() * width,
      y: -random() * height * 0.35 - 20,
      vx: (random() - 0.5) * 150 * scale,
      vy: (90 + random() * 170) * scale,
      w: (4 + random() * 4) * scale,
      h: (7 + random() * 6) * scale,
      color: COLORS[Math.floor(random() * COLORS.length)]!,
      spin: random() * Math.PI * 2,
      spinRate: (random() - 0.5) * 14,
      tilt: random() * Math.PI * 2,
      tiltRate: 3 + random() * 7,
      delay: 0.25 + random() * 0.9,
      life: 0,
    });
  }

  const initial = particles.map((p) => ({ ...p }));

  /** Fixed integration step, independent of either renderer's frame rate. */
  const STEP = 1 / 120;
  let simulated = 0;

  const rewind = () => {
    for (let i = 0; i < particles.length; i += 1) {
      Object.assign(particles[i]!, initial[i]!);
    }

    simulated = 0;
  };

  /**
   * Stepped at a fixed rate off a step counter rather than off wall-clock
   * deltas. The recorder and the screen tick at different rates, and only a
   * fixed step makes both land on identical frames — which is what lets the
   * downloaded file be the same celebration rather than a lookalike. Seeking
   * backwards (replay) rewinds and re-integrates.
   */
  const seek = (t: number) => {
    const seconds = Math.max(t, 0) / 1000;
    const target = Math.floor(seconds / STEP);

    if (target < simulated) rewind();

    while (simulated < target) {
      const now = simulated * STEP;

      for (const p of particles) {
        if (now < p.delay) continue;

        p.vx -= p.vx * SIDE_DRAG * STEP;
        p.vy += (GRAVITY * scale - p.vy * (GRAVITY / TERMINAL)) * STEP;
        p.x += p.vx * STEP;
        p.y += p.vy * STEP;
      }

      simulated += 1;
    }

    // Spin is analytic — it never feeds back into position, so it does not need
    // to be integrated and stays exact at any seek point.
    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i]!;
      const start = initial[i]!;

      p.life = seconds - start.delay;
      p.spin = start.spin + start.spinRate * Math.max(p.life, 0);
      p.tilt = start.tilt + start.tiltRate * Math.max(p.life, 0);
    }
  };

  return { particles, seek };
}

/** Fades the whole burst out at the end so the last frame is clean. */
export function confettiAlpha(t: number) {
  const fadeFrom = OUTRO_MS - 900;
  return t <= fadeFrom ? 1 : clamp01(1 - (t - fadeFrom) / 900);
}

export function drawConfetti(
  ctx: CanvasRenderingContext2D,
  confetti: Confetti,
  height: number,
  alpha: number,
) {
  if (alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = alpha;

  for (const p of confetti.particles) {
    if (p.life <= 0 || p.y - p.h > height) continue;

    // |cos| of the tilt squashes the ribbon towards edge-on and back, which is
    // what sells a flat piece of paper tumbling in three dimensions.
    const squash = Math.abs(Math.cos(p.tilt));

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.spin);
    ctx.fillStyle = p.color;
    // Edge-on ribbons catch less light, so they read slightly darker.
    ctx.globalAlpha = alpha * (0.55 + squash * 0.45);
    ctx.fillRect(-p.w / 2, (-p.h / 2) * squash, p.w, p.h * squash);
    ctx.restore();
  }

  ctx.restore();
}
