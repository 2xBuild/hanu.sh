"use client";

// TEMPORARY verification route — renders export frames statically so the
// landscape layout can be inspected without a real-time recording.

import { useEffect, useRef, useState } from "react";

import type { XProfile } from "@/lib/x-profile";

import { buildScene, HEIGHT, loadImage, renderFrame, WIDTH } from "../celebrate/_render";
import { LAND_MS, TOTAL_MS } from "../celebrate/_timeline";

const STOPS = [0, 300, LAND_MS - 40, LAND_MS + 220, LAND_MS + 900, TOTAL_MS];

export default function FramesPage() {
  const refs = useRef<(HTMLCanvasElement | null)[]>([]);
  const probe = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/x-profile?user=izzHanu");
        const profile = (await response.json()) as XProfile;
        const [avatar, banner] = await Promise.all([
          loadImage(profile.avatar),
          loadImage(profile.banner),
        ]);

        await document.fonts.ready;

        const scene = buildScene(
          profile,
          0,
          393,
          avatar,
          banner,
          12345,
          probe.current,
        );

        STOPS.forEach((t, i) => {
          const canvas = refs.current[i];
          const ctx = canvas?.getContext("2d");
          if (!ctx) return;

          scene.confetti.seek(0);
          renderFrame(ctx, scene, t);
        });
      } catch (e) {
        setError(String(e));
      }
    })();
  }, []);

  return (
    <main className="flex flex-col gap-2 bg-bg p-2">
      {error && <p className="text-red-500">{error}</p>}

      {/* Stands in for the live card so `readColors` resolves the same surface
          the real recording would — the theme is allowed to flatten it. */}
      <div ref={probe} className="celebrate-card hidden bg-[rgb(var(--ui-demo-bg))]" />

      {STOPS.map((t, i) => (
        <figure key={t} className="m-0">
          <canvas
            ref={(el) => {
              refs.current[i] = el;
            }}
            width={WIDTH}
            height={HEIGHT}
            className="w-full ring-1 ring-line"
          />
          <figcaption className="text-center text-[11px] text-muted">{t}ms</figcaption>
        </figure>
      ))}
    </main>
  );
}
