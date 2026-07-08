import Link from "next/link";
import { Shell, SectionTitle } from "../_shell";
import { HomeIcon } from "../_icons";

const journey = [
  {
    heading: "Solo builder",
    span: "2026 — present",
    text: "building dotschool.org, cutefol.io, tpot.cc and more.",
  },
  {
    heading: "Back to CS",
    span: "2025 — 2026",
    text: "building cool stuff and learning new things.",
  },
  {
    heading: "Gigs and Agency",
    span: "2023 — 2024",
    text: "built dev and marketing agency and quit.",
  },
  {
    heading: "Marketing: web3 and crypto",
    span: "2022 — 2023",
    text: "got interest off with coding and started a career in marketing, networking and executing campaigns for different projects with KOLs.",
  },
  {
    heading: "Solo dev: ButterLemonBot",
    span: "2020 — 2022",
    text: "a Telegram bot built for fun that eventually hit 10k+ users.",
  },
];

const stack = [
  {
    label: "Focus",
    body: "allrounder; from distributed systems to agentic ai. designing aesthetic stuff to selling it. ",
  },
  {
    label: "Frontend",
    body: "React, Next.js, TypeScript, Tailwind CSS, design systems, and modern component libraries.",
  },
  {
    label: "Backend",
    body: "Node.js, Express / Elysia, PostgreSQL, Redis, ORMs like Prisma and Drizzle, and REST / API design.",
  },
  {
    label: "DevOps",
    body: "Docker, CI/CD, AWS, Kubernetes.",
  },
];

export default function MePage() {
  return (
    <Shell>
      <Link
        href="/"
        className="silent-underline inline-flex items-center gap-2 text-sm text-muted"
      >
        <HomeIcon className="h-4 w-4" />
        home
      </Link>


      <SectionTitle>Stack</SectionTitle>
      <dl className="mt-6 flex flex-col gap-4 text-base leading-relaxed">
        {stack.map((s) => (
          <div key={s.label} className="flex flex-col gap-1 sm:flex-row sm:gap-6">
            <dt className="w-24 shrink-0 font-serif text-lg text-fg/90">
              {s.label}
            </dt>
            <dd className="text-fg/85">{s.body}</dd>
          </div>
        ))}
      </dl>

      <SectionTitle>Journey</SectionTitle>
      <ol className="mt-8 border-l border-line pl-6">
        {journey.map((j) => (
          <li key={j.heading} className="relative mb-8 last:mb-0">
            <span
              aria-hidden
              className="absolute -left-[27px] top-2 h-2 w-2 rounded-full bg-fg/60 ring-4 ring-bg"
            />
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-xl">{j.heading}</span>
              <span className="text-sm text-muted">({j.span})</span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted">{j.text}</p>
          </li>
        ))}
      </ol>
    </Shell>
  );
}
