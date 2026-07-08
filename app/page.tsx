import Link from "next/link";
import { Shell, SectionTitle } from "./_shell";
import { Pill } from "./_pill";
import { SiteLogo } from "./_site-logo";
import { ThemeToggleAvatar } from "./_theme-toggle";
import {
  MailIcon,
  GitHubIcon,
  LinkedInIcon,
  InstagramIcon,
  XIcon,
  ThreadsIcon,
  YouTubeIcon,
  BriefcaseIcon,
} from "./_icons";
import { projects } from "@/lib/projects";

export default function HomePage() {
  return (
    <Shell>
      <header>
        <div className="flex items-center gap-4"><h1 className="font-serif text-4xl leading-none sm:text-5xl">im</h1>
          <ThemeToggleAvatar />
          <h1 className="font-serif text-4xl leading-none sm:text-5xl">
            <span className="wordmark-underline">hanu</span>
          </h1>
        </div>

      </header>

      <section className="mt-8 max-w-[58ch] text-base leading-relaxed text-fg/90">
        <p>
          21 y.o. fullstack eng with design eyes who loves to explore, break and build.{" "}
          <span className="text-fg/75">co-founder at </span>
        <span className="inline-flex items-baseline gap-1 pl-1 align-baseline">
            <SiteLogo className="relative top-[0.08em] h-[0.95em] w-[0.95em]" src={projects[0].logo} name="onepurplepen" />
            <a
            href="https://onepurplepen.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-baseline"
          >
            <span>onepurplepen</span>
          </a>
          </span>
          .
        </p>
      </section>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Contact links">
        <Pill href="mailto:izzhanu@gmail.com" tone="violet" icon={<MailIcon className="h-4 w-4" />}>
          Email
        </Pill>
        <Pill href="https://github.com/2xBuild" tone="green" icon={<GitHubIcon className="h-4 w-4" />}>
          GitHub
        </Pill>
        <Pill
          href="https://www.linkedin.com/in/hanu-9958ab25b/"
          tone="blue"
          icon={<LinkedInIcon className="h-4 w-4" />}
        >
          LinkedIn
        </Pill>
        <Pill href="https://x.com/izzHanu" tone="amber" icon={<XIcon className="h-3.5 w-3.5" />}>
          (Twitter)
        </Pill>
        <Pill href="https://www.instagram.com/izz.hanu" tone="pink" icon={<InstagramIcon className="h-4 w-4" />}>
          Instagram
        </Pill>
        <Pill href="https://www.threads.com/@izz.hanu" tone="violet" icon={<ThreadsIcon className="h-4 w-4" />}>
          Threads
        </Pill>
        <Pill href="https://www.youtube.com/@izzHanu" tone="red" icon={<YouTubeIcon className="h-4 w-4" />}>
          YouTube
        </Pill>
      </nav>

      <SectionTitle>Projects</SectionTitle>

      <ul className="mt-8 flex flex-col gap-3 text-lg">
        {projects.map((p) => (
          <li key={p.name}>
            <a
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className={`silent-underline inline-flex items-center gap-3 font-serif text-2xl leading-tight ${
                p.visibility === "inactive" ? "text-fg/45" : ""
              }`}
            >
              <SiteLogo src={p.logo} name={p.name} className="h-5 w-5" />
              <span>{p.name}</span>
            </a>
          </li>
        ))}
      </ul>

      <SectionTitle>More</SectionTitle>

      <ul className="mt-6 flex flex-col gap-2 text-base">
        <li>
          <Link href="/me" className="silent-underline">
            About me
          </Link>{" "}
          <span className="text-muted">— stack, journey, and how I got here.</span>
        </li>
        <li>
          <Link href="/portfolio" className="silent-underline">
            Portfolio
          </Link>{" "}
          <span className="text-muted">— the apps I&apos;m building right now.</span>
        </li>
        <li>
          <Link href="/apps" className="silent-underline">
            Domains
          </Link>{" "}
          <span className="text-muted">— the domain garden I&apos;m tending.</span>
        </li>
      </ul>

    </Shell>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="silent-underline"
    >
      {children}
    </a>
  );
}
