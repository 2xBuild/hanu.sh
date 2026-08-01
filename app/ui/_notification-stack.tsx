"use client";

import { MessageCircle, Volume2, VolumeX, Zap, ZapOff } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const HOLD = 2800;
const PULSE = 1000;
const REVEAL = 400;
const DEPTH = 4;
const SPEEDS = [0.5, 1, 2, 4];

const items = [
  { title: "Maya", body: "Are we still meeting at seven?" },
  { title: "Arjun", body: "The latest version feels much smoother." },
  { title: "Nila", body: "I sent over the final references." },
  { title: "Sam", body: "That works perfectly for me." },
  { title: "Dev", body: "The preview is ready when you are." },
];

const ADVANCE = "duration-[var(--adv)] ease-[cubic-bezier(0.23,1,0.32,1)]";

const SLOTS: Record<string, string> = {
  "0": `z-50 translate-y-0 scale-100 opacity-100 ${ADVANCE}`,
  "1": `z-40 -translate-y-[16%] scale-[0.965] opacity-80 ${ADVANCE}`,
  "2": `z-30 -translate-y-[32%] scale-[0.93] opacity-[0.55] ${ADVANCE}`,
  "3": `z-20 -translate-y-[48%] scale-[0.895] opacity-30 ${ADVANCE}`,
  "4": `z-10 -translate-y-[64%] scale-[0.86] opacity-0 ${ADVANCE}`,
  exit: "z-[60] translate-y-[60%] scale-[0.97] opacity-0 duration-[var(--exit)] ease-[cubic-bezier(0.32,0.72,0,1)]",
};

// Skeleton and content share duration and ease so the swap reads as one motion.
const LAYER = "transition-[opacity,filter] duration-[var(--reveal)] ease-in-out motion-reduce:transition-none";

function chime(ctx: AudioContext | null) {
  if (ctx?.state !== "running") return;

  const start = ctx.currentTime;

  for (const [freq, delay] of [
    [880, 0],
    [1318.5, 0.06],
  ]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const at = start + delay;

    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.07, at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + 0.32);
  }
}

export function NotificationStack() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [sound, setSound] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [animated, setAnimated] = useState(true);
  const [loaded, setLoaded] = useState(-1);

  const ctxRef = useRef<AudioContext | null>(null);
  const soundRef = useRef(false);

  useEffect(() => {
    const sync = () => setPaused(document.hidden);

    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  useEffect(() => () => void ctxRef.current?.close(), []);

  useEffect(() => {
    if (paused) return;

    const timer = window.setTimeout(() => {
      if (soundRef.current) chime(ctxRef.current);
      setStep((n) => n + 1);
    }, HOLD / speed);

    return () => window.clearTimeout(timer);
  }, [step, paused, speed]);

  // Tickets only ever move forward, so a card that has loaded stays loaded —
  // the reveal never has to play in reverse.
  useEffect(() => {
    if (!animated) {
      setLoaded(step);
      return;
    }

    const timer = window.setTimeout(() => setLoaded(step), PULSE / speed);
    return () => window.clearTimeout(timer);
  }, [step, speed, animated]);

  function toggleSound() {
    const next = !sound;

    if (next) {
      ctxRef.current ??= new AudioContext();
      void ctxRef.current.resume();
    }

    soundRef.current = next;
    setSound(next);
  }

  // Ascending tickets keep every surviving card on its own DOM node, so CSS can
  // transition it from one slot to the next.
  const cards = [];

  for (let ticket = Math.max(step - 1, 0); ticket <= step + DEPTH; ticket += 1) {
    cards.push({
      ticket,
      slot: ticket < step ? "exit" : String(ticket - step),
      ...items[ticket % items.length],
    });
  }

  const timing = {
    "--adv": `${Math.round(460 / speed)}ms`,
    "--exit": `${Math.round(380 / speed)}ms`,
    "--body": `${Math.round(200 / speed)}ms`,
    "--pulse": `${Math.round(PULSE / speed)}ms`,
    "--reveal": `${Math.round(REVEAL / speed)}ms`,
  } as CSSProperties;

  return (
    <div className="absolute inset-0" style={timing}>
      <div
        className="absolute inset-0"
        role="img"
        aria-label="A stack of iOS-style notifications, each loading from a skeleton then sliding away"
      >
        {cards.map(({ ticket, slot, title, body }) => {
          const lead = slot === "0";
          const shown = !animated || ticket <= loaded;
          const fx = animated ? LAYER : "transition-none";

          return (
            <article
              key={ticket}
              className={`absolute left-1/2 top-[36%] w-[78%] origin-bottom -translate-x-1/2 rounded-2xl border border-fg/10 bg-[rgb(var(--ui-notification-bg)/0.78)] px-3 py-2.5 backdrop-blur-xl backdrop-saturate-150 will-change-[transform,opacity] motion-reduce:transition-opacity motion-reduce:duration-200 ${
                animated
                  ? "transition-[transform,opacity,background-color,border-color]"
                  : "transition-[background-color,border-color]"
              } ${SLOTS[slot]}`}
            >
              <div
                className={`relative transition-opacity duration-[var(--body)] ${
                  lead ? "opacity-100" : "opacity-0"
                }`}
              >
                <div
                  aria-hidden
                  className={`absolute inset-0 flex items-center gap-2.5 ${fx} ${
                    shown ? "opacity-0 blur-[2px]" : "opacity-100 blur-0"
                  } ${lead && !shown ? "animate-skeleton-pulse motion-reduce:animate-none" : ""}`}
                >
                  <div className="size-6 shrink-0 rounded-full bg-fg/20" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="h-2.5 w-1/4 rounded-full bg-fg/20" />
                    <div className="h-2 w-3/5 rounded-full bg-fg/15" />
                  </div>
                </div>

                <div
                  className={`flex items-center gap-2.5 ${fx} ${
                    shown ? "opacity-100 blur-0" : "opacity-0 blur-[2px]"
                  }`}
                >
                  <MessageCircle className="size-6 shrink-0 text-muted" strokeWidth={1.75} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold leading-tight text-fg">{title}</p>
                    <p className="truncate text-xs leading-tight text-muted">{body}</p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-fg/10 bg-[rgb(var(--ui-notification-bg)/0.72)] p-0.5 shadow-[0_10px_30px_rgb(var(--ui-demo-shadow)/0.14)] backdrop-blur-xl transition-[background-color,border-color] duration-300">
        {SPEEDS.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={speed === n}
            onClick={() => setSpeed(n)}
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums transition active:scale-95 ${
              speed === n ? "bg-fg/10 text-fg shadow-sm" : "text-muted hover:text-fg"
            }`}
          >
            {n}×
          </button>
        ))}

        <span className="mx-0.5 h-3.5 w-px bg-fg/15" />

        <button
          type="button"
          aria-pressed={animated}
          aria-label={animated ? "Turn animation off" : "Turn animation on"}
          onClick={() => setAnimated((on) => !on)}
          className="grid size-6 place-items-center rounded-full text-muted transition hover:bg-fg/10 hover:text-fg active:scale-90"
        >
          {animated ? <Zap className="size-3.5" /> : <ZapOff className="size-3.5" />}
        </button>

        <button
          type="button"
          aria-pressed={sound}
          aria-label={sound ? "Turn sound off" : "Turn sound on"}
          onClick={toggleSound}
          className="grid size-6 place-items-center rounded-full text-muted transition hover:bg-fg/10 hover:text-fg active:scale-90"
        >
          {sound ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}
