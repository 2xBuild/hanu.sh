"use client";

import { Moon, Pause, Play, RotateCcw, Sun, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const CADENCE = 2000; // ms between arrivals at 1×
const SPEEDS = [0.5, 1, 2, 4];

type Profile = { name: string; handle: string; avatar: string; verified: boolean };

const PROFILES: Profile[] = [
  { name: "Zihaan", handle: "@zihvvn", verified: true, avatar: "https://pbs.twimg.com/profile_images/2075174666856271872/CMR96HE5_bigger.jpg" },
  { name: "Anirudh Malik", handle: "@whoisaphysicist", verified: false, avatar: "https://pbs.twimg.com/profile_images/1984617058404089864/vUm5UWTK_bigger.jpg" },
  { name: "Alex Choi", handle: "@AlexChhk", verified: true, avatar: "https://pbs.twimg.com/profile_images/2076993692305362944/l-_9i-Q2_bigger.jpg" },
  { name: "Matt", handle: "@nevermatt", verified: false, avatar: "https://pbs.twimg.com/profile_images/2075374706354421760/MSaNSdrc_bigger.jpg" },
  { name: "sarv", handle: "@sarveshsea", verified: true, avatar: "https://pbs.twimg.com/profile_images/2078681987666022400/0-ee1IKH_bigger.jpg" },
  { name: "Priya", handle: "@priyabuilds", verified: false, avatar: "https://api.dicebear.com/9.x/notionists-neutral/svg?seed=Priya&backgroundColor=b6e3f4" },
  { name: "Giyu", handle: "@rutu_3", verified: false, avatar: "https://pbs.twimg.com/profile_images/1926898218589175808/bhWYOr5M_bigger.jpg" },
  { name: "International Sports Hub", handle: "@IntlSportsHub", verified: true, avatar: "https://pbs.twimg.com/profile_images/2056197927446728704/2jOZEg_U_bigger.jpg" },
  { name: "cindy", handle: "@cindehaa", verified: false, avatar: "https://pbs.twimg.com/profile_images/2046023351810854912/UKqeotwW_bigger.jpg" },
  { name: "Sol", handle: "@solstice_dev", verified: true, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=Sol&backgroundColor=ffd5dc" },
  { name: "aadi — e/acc", handle: "@aadithyanr_", verified: true, avatar: "https://pbs.twimg.com/profile_images/1938135816510771200/Mj1A9GgS_bigger.jpg" },
  { name: "pawan", handle: "@pawankalyandev", verified: false, avatar: "https://pbs.twimg.com/profile_images/2025649641820504064/3sUPaPw3_bigger.jpg" },
  { name: "Rain Miao", handle: "@rain8miao", verified: true, avatar: "https://pbs.twimg.com/profile_images/2060679781495246848/Y-EvO42H_bigger.jpg" },
  { name: "Kite", handle: "@kite_hq", verified: false, avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Kite&backgroundColor=c0aede" },
  { name: "TickenChikka", handle: "@TickenChikkka", verified: false, avatar: "https://pbs.twimg.com/profile_images/2042464186551451652/g6XnJEVj_bigger.jpg" },
  { name: "nikhil · sys/quests", handle: "@nick_realm_01", verified: true, avatar: "https://pbs.twimg.com/profile_images/2021858233300955136/Uwth2oM-_bigger.jpg" },
  { name: "utk", handle: "@defnotutkarsh", verified: true, avatar: "https://pbs.twimg.com/profile_images/2080288186702692353/CNe9Degb_bigger.jpg" },
  { name: "Wren", handle: "@wrenwrites", verified: false, avatar: "https://api.dicebear.com/9.x/open-peeps/svg?seed=Wren&backgroundColor=d1d4f9" },
  { name: "Ken", handle: "@kenrt_", verified: false, avatar: "https://pbs.twimg.com/profile_images/2058059370022498304/lPvS3YkV_bigger.jpg" },
  { name: "Humi", handle: "@byteHumi", verified: true, avatar: "https://pbs.twimg.com/profile_images/1942271548834078725/YvwrIkAn_bigger.jpg" },
  { name: "aetos", handle: "@aetosdios_", verified: false, avatar: "https://pbs.twimg.com/profile_images/2070798512728809472/MvT7r2rF_bigger.jpg" },
  { name: "Harsh Kasana", handle: "@0xkasana", verified: true, avatar: "https://pbs.twimg.com/profile_images/1952357395105009664/kLhDqGjk_bigger.jpg" },
  { name: "shorya", handle: "@Shorya_codes", verified: false, avatar: "https://pbs.twimg.com/profile_images/1919788070959730690/JkQ0W4VM_bigger.jpg" },
  { name: "daybot", handle: "@hashvalue", verified: true, avatar: "https://pbs.twimg.com/profile_images/2081404746070630400/Nrfh_7N8_bigger.jpg" },
];

const THEMES: Record<"light" | "dark", Record<string, string>> = {
  light: {
    "--x-bg": "255 255 255",
    "--x-fg": "15 20 25",
    "--x-sub": "83 100 113",
    "--x-line": "230 236 240",
    "--x-hover": "247 249 249",
    "--x-skel": "225 232 237",
    "--x-shadow": "15 20 25",
  },
  dark: {
    "--x-bg": "0 0 0",
    "--x-fg": "231 233 234",
    "--x-sub": "113 118 123",
    "--x-line": "47 51 54",
    "--x-hover": "23 25 27",
    "--x-skel": "32 35 39",
    "--x-shadow": "0 0 0",
  },
};

const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]";

// One follower gets room to breathe; the group trades that size for the row.
// `--step` is one avatar plus its gap, which is exactly how far the row shoves.
const SOLO = "[--av:48px] [--icon:26px] [--step:56px] sm:[--av:56px] sm:[--icon:28px] sm:[--step:64px]";
const GROUP = "[--av:32px] [--icon:22px] [--step:40px] sm:[--av:36px] sm:[--icon:24px] sm:[--step:44px]";

const TEXT = "transition-colors duration-300";

// 7 and 24 share no factors, so the group collects every profile exactly once
// before it would ever repeat one.
const profileFor = (id: number) => PROFILES[(id * 7) % PROFILES.length];

function ago(seconds: number) {
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

// Two quick, rounded notes read as a small social arrival instead of an alert.
// The filtered overtones add enough sparkle to feel intentional at low volume.
function followChime(ctx: AudioContext | null) {
  if (ctx?.state !== "running") return;

  const start = ctx.currentTime;
  const filter = ctx.createBiquadFilter();
  const tones: [frequency: number, delay: number, peak: number, decay: number, type: OscillatorType][] = [
    [659.25, 0, 0.07, 0.2, "sine"],
    [830.61, 0.065, 0.055, 0.28, "sine"],
    [1661.22, 0.065, 0.009, 0.18, "triangle"],
  ];

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2800, start);
  filter.Q.setValueAtTime(0.45, start);
  filter.connect(ctx.destination);

  for (const [frequency, delay, peak, decay, type] of tones) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const at = start + delay;

    osc.type = type;
    osc.frequency.setValueAtTime(frequency * 0.97, at);
    osc.frequency.exponentialRampToValueAtTime(frequency, at + 0.035);

    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peak, at + 0.009);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);

    osc.connect(gain).connect(filter);
    osc.start(at);
    osc.stop(at + decay + 0.02);
  }
}

function Follower({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <circle cx="12" cy="7.4" r="4.7" />
      <path d="M12 13.7c-4.4 0-7.9 2.7-7.9 6.2 0 .6.5 1.1 1.1 1.1h13.6c.6 0 1.1-.5 1.1-1.1 0-3.5-3.5-6.2-7.9-6.2Z" />
    </svg>
  );
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

export function FollowNotifications() {
  const [count, setCount] = useState(1);
  const [settled, setSettled] = useState(-1);
  const [since, setSince] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [playing, setPlaying] = useState(true);
  const [sound, setSound] = useState(false);
  const [hidden, setHidden] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const soundRef = useRef(false);

  const newest = count - 1;
  const opening = settled < 0;
  const arriving = newest > settled;
  const solo = count === 1;
  const complete = count >= PROFILES.length;
  const running = playing && !hidden && !complete;
  const lead = profileFor(newest);

  useEffect(() => {
    const sync = () => setHidden(document.hidden);

    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  useEffect(() => () => void ctxRef.current?.close(), []);

  useEffect(() => {
    if (!running) return;

    const timer = window.setTimeout(() => {
      if (soundRef.current) followChime(ctxRef.current);
      setCount((n) => n + 1);
    }, CADENCE / speed);

    return () => window.clearTimeout(timer);
  }, [running, newest, speed]);

  // An avatar paints once in its entering position, then flips to settled on the
  // next frame — the transition needs a committed "from" style to run against.
  // The timer is the backstop: a background tab never runs a frame callback, and
  // an avatar that never settles would sit there invisible until it is focused.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setSettled(newest));
    const timer = window.setTimeout(() => setSettled(newest), 120);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [newest]);

  // The group carries one timestamp — the latest arrival — so it resets on every
  // follower and only starts ageing once the group stops growing.
  useEffect(() => {
    setSince(0);

    const at = Date.now();
    const timer = window.setInterval(() => setSince(Math.round((Date.now() - at) / 1000)), 5000);

    return () => window.clearInterval(timer);
  }, [newest]);

  function toggleSound() {
    const next = !sound;

    if (next) {
      ctxRef.current ??= new AudioContext();
      void ctxRef.current.resume();
    }

    soundRef.current = next;
    setSound(next);
  }

  const vars = {
    ...THEMES[theme],
    "--x-blue": "29 155 240",
    "--enter": `${Math.round(460 / speed)}ms`,
    "--text": `${Math.round(300 / speed)}ms`,
    "--pulse": `${Math.round(900 / speed)}ms`,
  } as CSSProperties;

  // Newest first, so the avatar that leads the row is the name in the sentence.
  const ids = Array.from({ length: count }, (_, i) => newest - i);

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${solo ? SOLO : GROUP}`}
      style={vars}
    >
      {/* Two stacked backdrops cross-fade, because a gradient can't interpolate
          between themes — it would snap. */}
      <div
        className={`absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-20%,#ffffff_0%,#eef2f8_55%,#e4eaf3_100%)] transition-opacity duration-500 ease-out ${
          theme === "light" ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-20%,#131a22_0%,#08090b_55%,#000000_100%)] transition-opacity duration-500 ease-out ${
          theme === "dark" ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="absolute inset-x-6 top-1/2 h-24 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(29_155_240/0.14),transparent)] blur-xl" />

      <div className="absolute inset-0 flex items-center px-5 sm:px-6">
        {/* Flex wrapping does the layout switch: alone, the sentence sits beside
            the avatar; in a group the row takes the line and pushes it under. */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2.5">
          <Follower
            className={`size-[var(--icon)] shrink-0 text-[rgb(var(--x-blue))] transition-[width,height] duration-[var(--enter)] ${EASE} motion-reduce:transition-none`}
          />

          {/* The row only ever grows, so the far end fades out instead of
              stopping at a hard edge. */}
          <div
            className={`overflow-hidden ${
              solo
                ? "shrink-0"
                : "min-w-0 flex-1 [-webkit-mask-image:linear-gradient(to_right,#000_calc(100%_-_36px),transparent)] [mask-image:linear-gradient(to_right,#000_calc(100%_-_36px),transparent)]"
            }`}
          >
            {/* One transform on the whole row does the shove: the new avatar is
                added off the left edge, then everything slides by one step. */}
            <div
              className={`flex gap-2 transition-transform ${EASE} motion-reduce:transition-none ${
                arriving && !opening && !solo ? "-translate-x-[var(--step)] duration-0" : "translate-x-0 duration-[var(--enter)]"
              }`}
            >
              {ids.map((id, index) => {
                const entering = id > settled;

                return (
                  <span key={id} className="relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profileFor(id).avatar}
                      alt=""
                      width={72}
                      height={72}
                      referrerPolicy="no-referrer"
                      className={`size-[var(--av)] rounded-full bg-[rgb(var(--x-skel))] object-cover transition-[width,height,transform,opacity,filter,background-color] duration-[var(--enter)] ${EASE} motion-reduce:transition-[opacity] ${
                        entering ? "scale-75 opacity-0 blur-[3px]" : "scale-100 opacity-100 blur-0"
                      }`}
                    />

                    {index === 0 && (
                      <span
                        className={`pointer-events-none absolute -inset-1 rounded-full ring-2 ring-[rgb(var(--x-blue))] transition-[transform,opacity] duration-[var(--pulse)] ease-out motion-reduce:hidden ${
                          entering ? "scale-90 opacity-70" : "scale-[1.4] opacity-0"
                        }`}
                      />
                    )}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Name and count both change together, so the line refreshes as one
              piece rather than reflowing under its own words. */}
          <p
            className={`min-w-0 truncate leading-tight transition-[transform,opacity,filter] ease-out ${
              solo ? "flex-1 text-[14px] sm:text-[16px]" : "w-full pl-[34px] text-[13px] sm:pl-9 sm:text-[14px]"
            } ${
              arriving && !opening
                ? "translate-y-1 opacity-0 blur-[2px] duration-0"
                : "translate-y-0 opacity-100 blur-0 duration-[var(--text)]"
            }`}
          >
            <span className={`font-bold text-[rgb(var(--x-fg))] ${TEXT}`}>{lead.name}</span>
            {lead.verified && (
              <Verified className="mx-1 inline-block size-[1em] align-[-0.16em] text-[rgb(var(--x-blue))]" />
            )}
            <span className={`text-[rgb(var(--x-fg))] ${TEXT}`}>
              {count > 1 && ` and ${count - 1} ${count > 2 ? "others" : "other"}`} followed you
            </span>
            <span className={`text-[rgb(var(--x-sub))] ${TEXT}`}> · {ago(since)}</span>
          </p>
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-[rgb(var(--x-line))] bg-[rgb(var(--x-bg)/0.72)] p-0.5 shadow-lg shadow-[rgb(var(--x-shadow)/0.14)] backdrop-blur-md transition-colors duration-300">
        {SPEEDS.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={speed === n}
            onClick={() => setSpeed(n)}
            className={`rounded-full px-1.5 py-0.5 text-[10.5px] font-medium tabular-nums transition-[transform,color,background-color] duration-200 ease-out active:scale-95 ${
              speed === n
                ? "bg-[rgb(var(--x-fg)/0.12)] text-[rgb(var(--x-fg))]"
                : "text-[rgb(var(--x-sub))] hover:text-[rgb(var(--x-fg))]"
            }`}
          >
            {n}×
          </button>
        ))}

        <span className="mx-0.5 h-3.5 w-px bg-[rgb(var(--x-line))] transition-colors duration-300" />

        <button
          type="button"
          aria-pressed={theme === "dark"}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          className="grid size-6 place-items-center rounded-full text-[rgb(var(--x-sub))] transition-[transform,color,background-color] duration-200 ease-out hover:bg-[rgb(var(--x-hover))] hover:text-[rgb(var(--x-fg))] active:scale-90"
        >
          <span className="relative grid size-3.5 place-items-center">
            <Sun
              className={`absolute size-3.5 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-[opacity] ${
                theme === "light" ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
              }`}
            />
            <Moon
              className={`absolute size-3.5 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-[opacity] ${
                theme === "dark" ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
              }`}
            />
          </span>
        </button>

        <button
          type="button"
          aria-pressed={sound}
          aria-label={sound ? "Turn sound off" : "Turn sound on"}
          onClick={toggleSound}
          className="grid size-6 place-items-center rounded-full text-[rgb(var(--x-sub))] transition-[transform,color,background-color] duration-200 ease-out hover:bg-[rgb(var(--x-hover))] hover:text-[rgb(var(--x-fg))] active:scale-90"
        >
          {sound ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
        </button>

        {/* Once every profile has landed there is nothing left to pause, so the
            control becomes the way to watch the group fill again. */}
        <button
          type="button"
          aria-pressed={complete ? undefined : playing}
          aria-label={complete ? "Replay the feed" : playing ? "Pause the feed" : "Play the feed"}
          onClick={
            complete
              ? () => {
                  setCount(1);
                  setSettled(-1);
                }
              : () => setPlaying((on) => !on)
          }
          className="grid size-6 place-items-center rounded-full text-[rgb(var(--x-sub))] transition-[transform,color,background-color] duration-200 ease-out hover:bg-[rgb(var(--x-hover))] hover:text-[rgb(var(--x-fg))] active:scale-90"
        >
          {complete ? (
            <RotateCcw className="size-3.5" />
          ) : playing ? (
            <Pause className="size-3.5" />
          ) : (
            <Play className="size-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
