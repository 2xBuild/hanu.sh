import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function MailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

export function GitHubIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.09.68-.22.68-.48v-1.7c-2.78.62-3.37-1.19-3.37-1.19-.45-1.16-1.1-1.47-1.1-1.47-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.55 2.34 1.1 2.9.84.09-.66.35-1.1.63-1.35-2.22-.26-4.56-1.13-4.56-5.05 0-1.11.39-2.02 1.03-2.73-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.04a9.42 9.42 0 015 0c1.9-1.31 2.74-1.04 2.74-1.04.56 1.4.21 2.44.1 2.7.65.71 1.03 1.62 1.03 2.73 0 3.93-2.35 4.79-4.59 5.04.36.32.68.94.68 1.9v2.81c0 .27.18.58.69.48A10.02 10.02 0 0022 12.26C22 6.58 17.52 2 12 2z" />
    </svg>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.44-2.14 2.94v5.67H9.36V9h3.41v1.56h.05a3.75 3.75 0 013.37-1.85c3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.44a2.06 2.06 0 11-.01-4.12 2.06 2.06 0 01.01 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.25" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

export function ThreadsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M15.86 11.09c-.14-.07-.29-.14-.45-.2-.03-1.93-.82-3.39-2.25-4.15-1.13-.6-2.59-.77-4.23-.5-3.13.52-5.15 2.86-5.15 5.95 0 3.7 2.72 6.27 6.62 6.27 3.24 0 5.56-1.82 5.78-4.52.1-1.3-.28-2.34-1.14-3.1-.39-.35-.86-.64-1.4-.88.01.38 0 .77-.04 1.17.95.55 1.39 1.28 1.31 2.26-.16 1.92-1.86 3.15-4.34 3.15-3.13 0-4.8-2.08-4.8-4.35 0-2.15 1.39-3.76 3.54-4.11 1.19-.2 2.23-.09 3 .32.79.42 1.24 1.22 1.33 2.35a7.74 7.74 0 00-2.08-.27c-1.9 0-3.31.9-3.51 2.25-.15 1.03.43 2.43 2.97 2.43 1.93 0 3.2-.83 3.88-2.53.41.23.74.48.99.74.47.48.67 1.12.61 1.97-.17 2.08-2 4.2-5.71 4.2-4.65 0-8.03-3.13-8.03-7.44 0-4.15 2.76-7.31 6.86-7.99 2.06-.34 3.91-.11 5.36.65 1.94 1.02 3.05 2.95 3.15 5.49 1.22.74 2.04 1.76 2.48 3.06l-1.71.58c-.31-.93-.89-1.66-1.77-2.18z" />
    </svg>
  );
}

export function YouTubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.5 7.2a3 3 0 00-2.11-2.12C19.52 4.5 12 4.5 12 4.5s-7.52 0-9.39.58A3 3 0 00.5 7.2C0 9.07 0 12 0 12s0 2.93.5 4.8a3 3 0 002.11 2.12c1.87.58 9.39.58 9.39.58s7.52 0 9.39-.58a3 3 0 002.11-2.12c.5-1.87.5-4.8.5-4.8s0-2.93-.5-4.8zM9.6 15.5v-7L15.8 12l-6.2 3.5z" />
    </svg>
  );
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
      <path d="M3 12h18" />
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2l1.9 5.6L20 9.5l-6.1 1.9L12 17l-1.9-5.6L4 9.5l6.1-1.9z" />
    </svg>
  );
}

export function DomainFallbackIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}
