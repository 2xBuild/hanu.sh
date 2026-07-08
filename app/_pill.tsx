import type { ReactNode } from "react";

type Tone = "violet" | "green" | "blue" | "amber" | "olive" | "pink" | "red";

const tones: Record<Tone, string> = {
  violet: "bg-white/[0.05] text-fg/92 ring-white/10 hover:bg-white/[0.08]",
  green: "bg-white/[0.05] text-fg/92 ring-white/10 hover:bg-white/[0.08]",
  blue: "bg-white/[0.05] text-fg/92 ring-white/10 hover:bg-white/[0.08]",
  amber: "bg-white/[0.05] text-fg/92 ring-white/10 hover:bg-white/[0.08]",
  olive: "bg-white/[0.05] text-fg/92 ring-white/10 hover:bg-white/[0.08]",
  pink: "bg-white/[0.05] text-fg/92 ring-white/10 hover:bg-white/[0.08]",
  red: "bg-white/[0.05] text-fg/92 ring-white/10 hover:bg-white/[0.08]",
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
