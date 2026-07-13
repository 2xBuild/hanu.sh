import Link from "next/link";
import { Shell, SectionTitle } from "../_shell";
import { HomeIcon } from "../_icons";
import { SiteLogo } from "../_site-logo";
import { projects } from "@/lib/projects";

export default function PortfolioPage() {
  return (
    <Shell>
      <Link
        href="/"
        className="silent-underline inline-flex items-center gap-2 text-sm text-muted"
      >
        <HomeIcon className="h-4 w-4" />
        home
      </Link>

      <SectionTitle>What I&apos;m building</SectionTitle>

      <ul className="mt-8 flex flex-col gap-3 text-lg">
        {projects.map((p) => (
          <li key={p.name}>
            <a
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className={`silent-underline inline-flex items-center gap-3 font-serif text-[1.7rem] font-normal leading-[1.02] tracking-[-0.03em] ${
                p.visibility === "inactive" ? "text-fg/45" : "text-fg/95"
              } ${
                p.visibility === "closed"
                  ? "relative after:absolute after:top-1/2 after:left-0 after:w-full after:-translate-y-1/2 after:h-[2px] after:bg-current after:content-[''] opacity-60 grayscale text-fg/60"
                  : ""
              }`}
            >
              <SiteLogo src={p.logo} name={p.name} className={p.smallLogo ? "h-7 w-7" : "h-5 w-5"} />
              <span>{p.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
