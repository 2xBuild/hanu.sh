import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";

// Both are Latin subsets in woff2 — `next/font/local` ships source files as-is,
// and the unsubset Jeju Myeongjo is a 9.6 MB CJK face. See lib/og.ts for the
// matching .ttf cuts, which Satori needs for the OG images.
const generalSans = localFont({
  src: "./fonts/GeneralSans-Variable.woff2",
  variable: "--font-general-sans",
  display: "swap",
  weight: "200 700",
});

const jejuMyeongjo = localFont({
  src: "./fonts/JejuMyeongjo-Latin.woff2",
  variable: "--font-jeju-myeongjo",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: "hanu",
  description:
    "Hanu — 21 y.o. fullstack engineer with design eyes. I build interfaces, tools, and side projects for the web.",
  metadataBase: new URL("https://hanu.sh"),
  openGraph: {
    title: "hanu",
    description:
      "21 y.o. fullstack engineer with design eyes. I build interfaces, tools, and side projects for the web.",
    url: "https://hanu.sh",
    siteName: "hanu.sh",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "hanu",
    description:
      "21 y.o. fullstack engineer with design eyes. I build interfaces, tools, and side projects for the web.",
    creator: "@izzHanu",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${generalSans.variable} ${jejuMyeongjo.variable}`}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try {
            const savedTheme = localStorage.getItem("theme");
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            document.documentElement.dataset.theme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : systemTheme;
          } catch {}
          `}
        </Script>
      </head>
      <body className="min-h-dvh bg-bg font-sans text-fg antialiased">
        {children}
      </body>
    </html>
  );
}
