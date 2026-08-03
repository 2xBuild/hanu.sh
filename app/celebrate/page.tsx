import type { Metadata } from "next";
import Link from "next/link";

import { HomeIcon } from "../_icons";
import { Celebrate } from "./_celebrate";

const description =
  "Count your X followers up to a milestone, set it off with confetti, and take the whole thing away as a video.";

export const metadata: Metadata = {
  title: "celebrate",
  description,
  openGraph: {
    title: "celebrate",
    description,
    url: "https://hanu.sh/celebrate",
    siteName: "hanu.sh",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "celebrate",
    description,
    creator: "@izzHanu",
  },
};

export default function CelebratePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
      <Link
        href="/"
        className="silent-underline inline-flex items-center gap-2 text-sm text-muted"
      >
        <HomeIcon className="h-4 w-4" />
        home
      </Link>

      <div className="mt-10 text-center">
        <h1 className="font-serif text-[clamp(1.9rem,6vw,2.6rem)] font-normal leading-none tracking-[-0.02em] text-fg">
          celebrate
        </h1>
        <p className="mx-auto mt-4 max-w-[42ch] text-balance text-sm leading-relaxed text-muted">
          Put in your handle, pick the number you climbed to, and watch it land.
          The whole run saves as a video.
        </p>
      </div>

      <div className="mt-10">
        <Celebrate />
      </div>
    </main>
  );
}
