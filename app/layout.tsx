import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const generalSans = localFont({
  src: "./fonts/GeneralSans-Variable.ttf",
  variable: "--font-general-sans",
  display: "swap",
  weight: "200 700",
});

const jejuMyeongjo = localFont({
  src: "./fonts/JejuMyeongjo-Regular.ttf",
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
      className={`${generalSans.variable} ${jejuMyeongjo.variable}`}
    >
      <body className="min-h-dvh bg-bg font-sans text-fg antialiased">
        {children}
      </body>
    </html>
  );
}
