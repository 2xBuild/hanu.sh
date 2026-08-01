import { readFileSync } from "fs";
import { join } from "path";

/** Shared bits for the `opengraph-image` routes. These run at build time, so
 *  reading straight off disk beats shipping the fonts through the bundler. */

const asset = (path: string) => readFileSync(join(process.cwd(), path));

export const ogSize = { width: 1200, height: 630 };

/** Site palette, mirrored from `app/globals.css`. Satori has no CSS variables. */
export const dark = {
  bg: "#0a0a0a",
  fg: "#e6e6e6",
  muted: "#8a8a8a",
  line: "#2a2a2a",
  accent: "#60a5fa",
};

export const light = {
  bg: "#f8fafc",
  fg: "#0f172a",
  muted: "#64748b",
  line: "#e2e8f0",
  accent: "#6366f1",
};

/** Satori reads neither woff2 nor the variable General Sans the site ships, so
 *  these routes get .ttf cuts of the same faces: a Latin subset of the serif,
 *  and static instances of the sans (`fonttools varLib.instancer wght=400|600`). */
export function ogFonts() {
  return [
    {
      name: "Jeju Myeongjo",
      data: asset("app/fonts/JejuMyeongjo-Latin.ttf"),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "General Sans",
      data: asset("app/fonts/GeneralSans-Regular.ttf"),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "General Sans",
      data: asset("app/fonts/GeneralSans-Semibold.ttf"),
      weight: 600 as const,
      style: "normal" as const,
    },
  ];
}

export function avatarDataUri() {
  return `data:image/png;base64,${asset("public/me.png").toString("base64")}`;
}
