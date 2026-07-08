import Link from "next/link";
import { Shell, SectionTitle } from "../_shell";
import { HomeIcon } from "../_icons";
import { SiteLogo } from "../_site-logo";
import { domains } from "@/lib/domains";

export default function AppsPage() {
  return (
    <Shell>
      <Link
        href="/"
        className="silent-underline inline-flex items-center gap-2 text-sm text-muted"
      >
        <HomeIcon className="h-4 w-4" />
        home
      </Link>

      <SectionTitle>domain-folio</SectionTitle>

      <p className="mt-8 max-w-[58ch] text-base leading-relaxed text-fg/85">
        A small garden of domain names I&apos;ve collected. Some are for future
        projects, some are just fun. If you want one, ping me on{" "}
        <a
          href="https://x.com/izzHanu"
          target="_blank"
          rel="noreferrer"
          className="silent-underline"
        >
          twitter/x
        </a>
        .
      </p>

      

      <ul className="mt-8 grid grid-cols-1 gap-y-3 sm:grid-cols-2">
        {domains.map((d) => (
          <li key={d.name}>
            <a
              href={d.href}
              target="_blank"
              rel="noreferrer"
              className="silent-underline inline-flex items-center gap-3 font-serif text-lg"
            >
              <SiteLogo src={d.logo} name={d.name} />
              {d.name}
            </a>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
