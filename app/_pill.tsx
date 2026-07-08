import type { ReactNode } from "react";

type Tone = "violet" | "green" | "blue" | "amber" | "olive" | "pink" | "red";

const tones: Record<Tone, string> = {
  violet: "bg-surface/5 text-fg/92 ring-line hover:bg-surface/8",
  green: "bg-surface/5 text-fg/92 ring-line hover:bg-surface/8",
  blue: "bg-surface/5 text-fg/92 ring-line hover:bg-surface/8",
  amber: "bg-surface/5 text-fg/92 ring-line hover:bg-surface/8",
  olive: "bg-surface/5 text-fg/92 ring-line hover:bg-surface/8",
  pink: "bg-surface/5 text-fg/92 ring-line hover:bg-surface/8",
  red: "bg-surface/5 text-fg/92 ring-line hover:bg-surface/8",
};

export function Pill({
  href,
  tone,
  icon,
  children,
}: {
  href: string;
  tone: Tone;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm ring-1 transition-colors ${tones[tone]}`}
    >
      <span className="grid h-4 w-4 place-items-center">{icon}</span>
      <span>{children}</span>
    </a>
  );
}
