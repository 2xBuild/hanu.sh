"use client";

import { Check, Download, Loader2, RotateCcw, Volume2, VolumeX, X as Close } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";

import { FOLLOWERS_MAX, formatCount, formatJoined, toHandle, type XProfile } from "@/lib/x-profile";

import {
  buildScene,
  extensionFor,
  loadImage,
  pickMimeType,
  recordCelebration,
  HEIGHT,
  WIDTH,
} from "./_render";
import { scheduleSoundtrack } from "./_sound";
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

/** The card's own palette, aliased off the shared X-flavoured tokens. */
const CARD_VARS = {
  "--x-bg": "var(--ui-demo-bg)",
  "--x-fg": "var(--ui-demo-fg)",
  "--x-sub": "var(--ui-demo-muted)",
  "--x-line": "var(--ui-demo-line)",
  "--x-skel": "var(--ui-demo-skeleton)",
  "--x-shadow": "var(--ui-demo-shadow)",
  "--x-blue": "29 155 240",
} as CSSProperties;

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

type Lookup = { state: "idle" | "loading" | "found" | "missing"; profile: XProfile | null };

/** Stable per handle and target, so a replay is the same celebration twice. */
function seedFor(username: string, to: number) {
  let hash = to >>> 0;
  for (let i = 0; i < username.length; i += 1) hash = (hash * 31 + username.charCodeAt(i)) >>> 0;
  return hash || 1;
}

function digits(value: number) {
  return Math.max(String(Math.floor(Math.max(value, 0))).length, 1);
}

function toNumber(value: string) {
  const n = Number(value.replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? Math.min(n, FOLLOWERS_MAX) : 0;
}

function Verified({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Verified account" className={className}>
      <path
        fill="currentColor"
        d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
      />
      <path
        d="m8.7 12.1 2.2 2.2 4.4-4.6"
        fill="none"
        stroke="#fff"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ form -- */

function Field({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <label className="flex-1">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      <input
        // Separated on the way out, digits only on the way in. Seven-figure
        // counts are the ones worth celebrating and the ones nobody can read
        // unseparated.
        value={value ? Number(value).toLocaleString("en-US") : ""}
        onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, "").slice(0, 10))}
        inputMode="numeric"
        placeholder="0"
        className="w-full rounded-xl border border-line bg-transparent px-3.5 py-2.5 text-[15px] tabular-nums text-fg outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted/60 focus:border-fg/30 focus:ring-4 focus:ring-fg/5"
      />
      {hint && <span className="mt-1.5 block text-[11px] text-muted">{hint}</span>}
    </label>
  );
}

/* -------------------------------------------------------------- odometer -- */

type OdometerHandle = { set: (value: number) => void };

/**
 * Places are laid out once and driven imperatively from the frame loop after
 * that — a counter that re-rendered React 60 times a second would be doing the
 * one thing this animation cannot afford. See `placeAt` for what each place
 * shows and when it turns over.
 */
function Odometer({ places, handle }: { places: number; handle: { current: OdometerHandle | null } }) {
  const columns = useRef<(HTMLSpanElement | null)[]>([]);
  const cells = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    handle.current = {
      set(value) {
        for (let i = 0; i < places; i += 1) {
          const column = columns.current[i];
          const cell = cells.current[i];
          if (!column || !cell) continue;

          const { digit, roll, alpha } = placeAt(value, places - 1 - i);

          // Transform only — no layout, no paint, straight to the compositor.
          column.style.transform = `translateY(${-(digit + roll)}em)`;
          cell.style.opacity = String(alpha);
        }
      },
    };

    return () => {
      handle.current = null;
    };
  }, [places, handle]);

  return (
    <span aria-hidden className="flex items-start leading-none">
      {Array.from({ length: places }, (_, i) => {
        const place = places - 1 - i;

        return (
          <span key={place} className="flex">
            <span
              ref={(el) => {
                cells.current[i] = el;
              }}
              className="block h-[1em] overflow-hidden"
            >
              {/* The column carries all ten glyphs, so the cell is exactly as
                  wide as the widest digit without needing tabular figures. */}
              <span
                ref={(el) => {
                  columns.current[i] = el;
                }}
                className="block will-change-transform"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit, index) => (
                  <span key={index} className="block h-[1em] text-center leading-[1em]">
                    {digit}
                  </span>
                ))}
              </span>
            </span>

            {place > 0 && place % 3 === 0 && <span className="block h-[1em] leading-[1em]">,</span>}
          </span>
        );
      })}
    </span>
  );
}

/* ------------------------------------------------------------------ card -- */

/**
 * The counter is fitted to its column rather than trusting one size to work for
 * every milestone — nine digits and two separators is a great deal wider than
 * three, and the row it sits in is a fixed fraction of the card.
 */
function heroSize(places: number) {
  if (places >= 9) return "text-[clamp(1.4rem,4.2vw,2rem)]";
  if (places >= 7) return "text-[clamp(1.65rem,5vw,2.4rem)]";
  return "text-[clamp(1.9rem,5.8vw,2.8rem)]";
}

function ProfileCard({
  profile,
  from,
  to,
  odometer,
  heroRef,
  chipRef,
  cardRef,
}: {
  profile: XProfile;
  from: number;
  to: number;
  odometer: { current: OdometerHandle | null };
  heroRef: React.RefObject<HTMLDivElement | null>;
  chipRef: React.RefObject<HTMLDivElement | null>;
  cardRef: React.RefObject<HTMLElement | null>;
}) {
  const gained = to - from;
  const places = digits(Math.max(from, to));

  return (
    <article
      ref={cardRef}
      // Opacity and scale are owned by the frame loop from here on; starting
      // them off-state stops the card flashing at full size before frame zero.
      style={{ ...CARD_VARS, opacity: 0, transform: "scale(0.96)" }}
      className="celebrate-card relative w-full overflow-hidden rounded-[20px] bg-[rgb(var(--x-bg))] shadow-[0_24px_70px_-20px_rgb(var(--x-shadow)/0.28)] ring-1 ring-[rgb(var(--x-line))] transition-colors duration-300 will-change-[transform,opacity]"
    >
      {/* X's own 3:1 banner ratio — a pale banner is otherwise indistinguishable
          from the card beneath it, so a hairline pins its lower edge. */}
      <div className="relative aspect-[3/1] w-full border-b border-[rgb(var(--x-line))] bg-[rgb(var(--x-skel))] transition-colors duration-300">
        {profile.banner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.banner}
            alt=""
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            className="size-full object-cover"
          />
        )}
      </div>

      {/* Body: single column, exactly the stack an X profile shows. */}
      <div className="px-5 pb-5 sm:px-7 sm:pb-6">
        {/* Avatar left, mark right — the corner an X profile keeps for the
            Follow button. `relative` keeps this above the banner. */}
        <div className="relative flex items-end justify-between">
          <div className="-mt-[14%] rounded-full bg-[rgb(var(--x-bg))] p-1 transition-colors duration-300 sm:-mt-[12%]">
            {profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar}
                alt=""
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                className="block aspect-square w-[22vw] max-w-[128px] rounded-full bg-[rgb(var(--x-skel))] object-cover"
              />
            ) : (
              <div className="grid aspect-square w-[22vw] max-w-[128px] place-items-center rounded-full bg-[rgb(var(--x-sub)/0.2)] text-[2rem] font-semibold text-[rgb(var(--x-fg))]">
                {profile.name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <span className="mb-1 rounded-full border border-[rgb(var(--x-line))] px-3.5 py-1.5 text-[12px] font-medium text-[rgb(var(--x-sub))] transition-colors duration-300 sm:px-4 sm:text-[13px]">
            hanu.sh/celebrate
          </span>
        </div>

        <h2 className="mt-3 flex items-center gap-1.5 text-[20px] font-semibold leading-tight tracking-[-0.01em] text-[rgb(var(--x-fg))] transition-colors duration-300 sm:text-[24px]">
          <span className="truncate">{profile.name}</span>
          {profile.isVerified && (
            <Verified className="size-[0.9em] shrink-0 text-[rgb(var(--x-blue))]" />
          )}
        </h2>

        <p className="mt-0.5 text-[14px] text-[rgb(var(--x-sub))] transition-colors duration-300 sm:text-[15px]">
          @{profile.username}
        </p>

        {profile.bio && (
          <p className="mt-3 line-clamp-3 text-[14px] leading-relaxed text-[rgb(var(--x-fg))] transition-colors duration-300 sm:text-[15px]">
            {profile.bio}
          </p>
        )}

        {(profile.location || profile.createdAt) && (
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[rgb(var(--x-sub))] transition-colors duration-300">
            {profile.location && <span>{profile.location}</span>}
            {profile.location && profile.createdAt && <span aria-hidden>·</span>}
            {profile.createdAt && <span>Joined {formatJoined(profile.createdAt)}</span>}
          </p>
        )}

        {/* Stats row: Following alongside the animated Followers stat. The
            counter is oversized but still lives inside the row, so the card
            reads as a profile with one blown-up stat rather than a hero panel
            wearing a profile. */}
        <div className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-3 sm:mt-6">
          <span className="text-[14px] text-[rgb(var(--x-sub))] transition-colors duration-300 sm:text-[15px]">
            <span className="font-semibold text-[rgb(var(--x-fg))]">
              {formatCount(profile.following)}
            </span>{" "}
            Following
          </span>

          <div
            ref={heroRef}
            className={`relative inline-flex items-baseline gap-2 font-bold tracking-[-0.02em] text-[rgb(var(--x-fg))] transition-colors duration-300 will-change-transform ${heroSize(places)}`}
          >
            <Odometer places={places} handle={odometer} />
            <span className="text-[14px] font-normal text-[rgb(var(--x-sub))] sm:text-[15px]">
              Followers
            </span>
            {/* The number is unreadable mid-roll by design, so the accessible
                value is announced once, when it lands. */}
            <span className="sr-only" aria-live="polite">
              {to.toLocaleString("en-US")} followers
            </span>
          </div>

          {gained > 0 && (
            <div ref={chipRef} className="opacity-0 will-change-transform">
              <span className="rounded-full bg-[rgb(var(--x-blue)/0.12)] px-3 py-1 text-[12px] font-semibold text-[rgb(var(--x-blue))] sm:text-[13px]">
                +{formatCount(gained)} new followers
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ page -- */

export function Celebrate() {
  const [handleInput, setHandleInput] = useState("");
  const [lookup, setLookup] = useState<Lookup>({ state: "idle", profile: null });
  const [from, setFrom] = useState("0");
  const [to, setTo] = useState("");
  const [toTouched, setToTouched] = useState(false);
  const [running, setRunning] = useState<XProfile | null>(null);
  const [sound, setSound] = useState(true);
  const [download, setDownload] = useState<{
    state: "idle" | "working" | "done" | "error";
    progress: number;
  }>({ state: "idle", progress: 0 });
  const [reduced, setReduced] = useState(false);

  const odometer = useRef<OdometerHandle | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const chipRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const audioRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const soundRef = useRef(true);
  const frameRef = useRef(0);
  const confettiRef = useRef<Confetti | null>(null);
  const imagesRef = useRef<{ avatar: HTMLImageElement | null; banner: HTMLImageElement | null }>({
    avatar: null,
    banner: null,
  });

  const handle = toHandle(handleInput);
  const fromValue = toNumber(from);
  const toValue = toNumber(to);
  const profile = lookup.profile;
  const ready = lookup.state === "found" && profile !== null && toValue > fromValue;
  // Resolved after mount rather than during render: `MediaRecorder` does not
  // exist on the server, and branching on `typeof window` mid-render is exactly
  // the shape that produces a hydration mismatch.
  const [mimeType, setMimeType] = useState<string | null>(null);
  useEffect(() => setMimeType(pickMimeType()), []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => () => void audioRef.current?.close(), []);
  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  /* Debounced handle lookup. Every keystroke aborts the previous request, so a
     fast typist makes exactly one call for the handle they land on. */
  useEffect(() => {
    if (!handle) {
      setLookup({ state: "idle", profile: null });
      return;
    }

    const controller = new AbortController();
    setLookup((current) => ({ ...current, state: "loading" }));

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/x-profile?user=${encodeURIComponent(handle)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          setLookup({ state: "missing", profile: null });
          return;
        }

        const found = (await response.json()) as XProfile;
        setLookup({ state: "found", profile: found });
        setTo((current) => (toTouched && current ? current : String(found.followers)));
      } catch (error) {
        if ((error as Error).name !== "AbortError") setLookup({ state: "missing", profile: null });
      }
    }, 420);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
    // `toTouched` is read, not tracked: a lookup should not re-fire because the
    // visitor edited the target count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);

  /* Preload the images as CORS-clean elements. The card renders its own `<img>`
     tags, but the canvas needs decoded `HTMLImageElement`s it is allowed to
     read back — without that the export throws a security error on the first
     `captureStream` frame. */
  useEffect(() => {
    if (!profile) return;

    let live = true;

    void Promise.all([loadImage(profile.avatar), loadImage(profile.banner)]).then(
      ([avatar, banner]) => {
        if (live) imagesRef.current = { avatar, banner };
      },
    );

    return () => {
      live = false;
    };
  }, [profile]);

  const paintConfetti = useCallback((t: number) => {
    const canvas = canvasRef.current;
    const confetti = confettiRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !confetti || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    if (t < LAND_MS) return;

    const since = t - LAND_MS;
    confetti.seek(since);
    drawConfetti(ctx, confetti, canvas.height / dpr, confettiAlpha(since));
  }, []);

  /** One frame of the on-screen run: counter, kick, chip, confetti. */
  const paint = useCallback(
    (t: number, target: { from: number; to: number }) => {
      odometer.current?.set(countAt(t, target.from, target.to));

      const landed = t - LAND_MS;

      // The entrance is driven from the same clock rather than a CSS animation,
      // so a replay restarts it and the recorded run matches frame for frame.
      if (cardRef.current) {
        const enter = intro(t);
        cardRef.current.style.opacity = String(enter);
        cardRef.current.style.transform = `scale(${0.96 + enter * 0.04})`;
      }

      if (heroRef.current) {
        const kick = 1 + pop(landed) * 0.055;
        heroRef.current.style.transform = `scale(${kick})`;
      }

      if (chipRef.current) {
        const chipIn = easeOutExpo(clamp01(landed / 520));
        chipRef.current.style.opacity = String(chipIn);
        chipRef.current.style.transform = `translateY(${(1 - chipIn) * 10}px)`;
      }

      paintConfetti(t);
    },
    [paintConfetti],
  );

  const play = useCallback(
    (target: XProfile, range: { from: number; to: number }) => {
      cancelAnimationFrame(frameRef.current);

      const stage = stageRef.current;
      const canvas = canvasRef.current;

      if (stage && canvas) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = stage.getBoundingClientRect();

        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        // Fired from behind the counter itself, so the burst reads as coming
        // out of the number rather than off the middle of the card.
        const origin = (heroRef.current ?? cardRef.current)?.getBoundingClientRect();
        confettiRef.current = createConfetti(
          rect.width,
          rect.height,
          origin ? origin.left - rect.left + origin.width / 2 : rect.width / 2,
          origin ? origin.top - rect.top + origin.height / 2 : rect.height / 2,
          seedFor(target.username, range.to),
        );
      }

      // Reduced motion keeps the outcome and drops the journey: the number is
      // simply true, and nothing flies across the screen.
      if (reduced) {
        paint(TOTAL_MS, range);
        return;
      }

      if (soundRef.current) {
        const audio = (audioRef.current ??= new AudioContext());
        void audio.resume();

        // Orphan the previous run rather than stopping each node: disconnecting
        // the master silences everything still scheduled under it.
        masterRef.current?.disconnect();
        masterRef.current = scheduleSoundtrack(
          audio,
          audio.destination,
          audio.currentTime + 0.06,
          LAND_MS,
        );
      }

      const started = performance.now();

      const frame = () => {
        const t = performance.now() - started;

        paint(Math.min(t, TOTAL_MS), range);
        if (t < TOTAL_MS) frameRef.current = requestAnimationFrame(frame);
      };

      paint(0, range);
      frameRef.current = requestAnimationFrame(frame);
    },
    [paint, reduced],
  );

  function start(event: FormEvent) {
    event.preventDefault();
    if (!ready || !profile) return;

    setRunning(profile);
    setDownload({ state: "idle", progress: 0 });

    // The card has to exist before the first frame can address it.
    requestAnimationFrame(() => {
      stageRef.current?.scrollIntoView({
        block: "center",
        behavior: reduced ? "auto" : "smooth",
      });
      play(profile, { from: fromValue, to: toValue });
    });
  }

  function toggleSound() {
    const next = !sound;

    soundRef.current = next;
    setSound(next);

    const master = masterRef.current;
    const audio = audioRef.current;

    if (master && audio) {
      master.gain.cancelScheduledValues(audio.currentTime);
      master.gain.linearRampToValueAtTime(next ? 0.9 : 0.0001, audio.currentTime + 0.08);
    }
  }

  async function saveVideo() {
    if (!running || download.state === "working") return;

    setDownload({ state: "working", progress: 0 });

    try {
      const { avatar, banner } = imagesRef.current;
      const scene = buildScene(
        running,
        fromValue,
        toValue,
        avatar,
        banner,
        seedFor(running.username, toValue),
        cardRef.current,
      );

      // The recorded run has its own audio graph writing into the recorder, so
      // the file always has sound even when the page is muted.
      const blob = await recordCelebration(
        scene,
        (ctx, destination, at) => void scheduleSoundtrack(ctx, destination, at, LAND_MS),
        (progress) => setDownload({ state: "working", progress }),
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${running.username}-${toValue}-followers.${extensionFor(blob.type)}`;
      link.click();

      // Revoked on the next tick — Safari needs the object URL to outlive the
      // synchronous click handler.
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setDownload({ state: "done", progress: 1 });
    } catch (error) {
      // Swallowing this would leave the button looking untouched, which reads
      // as a dead control rather than a failure.
      console.error("celebrate: recording failed", error);
      setDownload({ state: "error", progress: 0 });
    }
  }

  function reset() {
    cancelAnimationFrame(frameRef.current);
    masterRef.current?.disconnect();
    masterRef.current = null;
    setRunning(null);
    setDownload({ state: "idle", progress: 0 });
  }

  /* ------------------------------------------------------------- render -- */

  if (running) {
    const recording = download.state === "working";

    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
        <div ref={stageRef} className="relative w-full py-6">
          <ProfileCard
            profile={running}
            from={fromValue}
            to={toValue}
            odometer={odometer}
            heroRef={heroRef}
            chipRef={chipRef}
            cardRef={cardRef}
          />

          {/* Above the card, and never in the way of a pointer. */}
          <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 z-10" />
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => play(running, { from: fromValue, to: toValue })}
            disabled={recording}
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[13px] font-medium text-fg transition-[transform,background-color,border-color] duration-200 ease-out hover:bg-fg/5 active:scale-[0.97] disabled:opacity-40"
          >
            <RotateCcw className="size-3.5" />
            Replay
          </button>

          <button
            type="button"
            onClick={saveVideo}
            disabled={recording || !mimeType}
            title={mimeType ? undefined : "This browser cannot record video"}
            className="flex items-center gap-2 rounded-full bg-fg px-4 py-2 text-[13px] font-medium text-bg transition-[transform,opacity] duration-200 ease-out active:scale-[0.97] disabled:opacity-40"
          >
            {recording ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : download.state === "done" ? (
              <Check className="size-3.5" />
            ) : (
              <Download className="size-3.5" />
            )}
            {recording
              ? `Recording ${Math.round(download.progress * 100)}%`
              : download.state === "done"
                ? "Saved"
                : download.state === "error"
                  ? "Try again"
                  : "Download video"}
          </button>

          <button
            type="button"
            aria-pressed={sound}
            aria-label={sound ? "Turn sound off" : "Turn sound on"}
            onClick={toggleSound}
            className="grid size-9 place-items-center rounded-full border border-line text-muted transition-[transform,background-color,color] duration-200 ease-out hover:bg-fg/5 hover:text-fg active:scale-90"
          >
            {sound ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
          </button>

          <button
            type="button"
            aria-label="Start over"
            onClick={reset}
            disabled={recording}
            className="grid size-9 place-items-center rounded-full border border-line text-muted transition-[transform,background-color,color] duration-200 ease-out hover:bg-fg/5 hover:text-fg active:scale-90 disabled:opacity-40"
          >
            <Close className="size-3.5" />
          </button>
        </div>

        <p className="mt-4 h-4 text-center text-[12px] text-muted transition-opacity duration-300">
          {recording
            ? "Recording in real time. keep this tab in front."
            : download.state === "done"
              ? `Saved as .${mimeType ? extensionFor(mimeType) : "mp4"} · ${WIDTH}×${HEIGHT}`
              : download.state === "error"
                ? "The recording did not finish. Keep this tab in front and try again."
                : ""}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={start} className="mx-auto w-full max-w-sm">
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          X username
        </span>

        <div className="flex items-center gap-2 rounded-xl border border-line px-3.5 transition-[border-color,box-shadow] duration-200 focus-within:border-fg/30 focus-within:ring-4 focus-within:ring-fg/5">
          <span className="text-[15px] text-muted">@</span>
          <input
            value={handleInput}
            onChange={(event) => setHandleInput(event.target.value)}
            placeholder="izzHanu"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-fg outline-none placeholder:text-muted/60"
          />

          {lookup.state === "loading" && <Loader2 className="size-3.5 animate-spin text-muted" />}
        </div>
      </label>

      {/* Fixed height: the row reserves its space so confirming a handle never
          shoves the fields below it down the page. */}
      <div className="mt-3 flex h-10 items-center gap-2">
        {profile && lookup.state === "found" && (
          <div
            className="flex animate-[fade-up_240ms_cubic-bezier(0.23,1,0.32,1)] items-center gap-2 text-[13px]"
            style={{ animationFillMode: "both" }}
          >
            {profile.avatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar}
                alt=""
                referrerPolicy="no-referrer"
                className="size-7 rounded-full bg-line object-cover"
              />
            )}
            <span className="font-medium text-fg">{profile.name}</span>
            <span className="text-muted">{formatCount(profile.followers)} followers</span>
          </div>
        )}

        {lookup.state === "missing" && (
          <p className="text-[13px] text-muted">No account found for @{handle}.</p>
        )}
      </div>

      <div className="mt-2 flex gap-3">
        <Field label="From" value={from} onChange={setFrom} />
        <Field
          label="To"
          value={to}
          onChange={(value) => {
            setToTouched(true);
            setTo(value);
          }}
          hint={profile ? `Now at ${formatCount(profile.followers)}` : undefined}
        />
      </div>

      <button
        type="submit"
        disabled={!ready}
        className="mt-5 w-full rounded-xl bg-fg py-3 text-[14px] font-medium text-bg transition-[transform,opacity] duration-200 ease-out active:scale-[0.98] disabled:opacity-30"
        style={{ transitionTimingFunction: EASE }}
      >
        Celebrate
      </button>

      <p className="mt-3 h-4 text-center text-[12px] text-muted">
        {lookup.state === "found" && toValue <= fromValue ? "The target has to be above the start." : ""}
      </p>
    </form>
  );
}
