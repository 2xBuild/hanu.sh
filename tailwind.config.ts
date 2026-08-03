import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  // Touch devices fire :hover on tap and leave it stuck. This scopes every
  // `hover:` utility to @media (hover: hover) and (pointer: fine).
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-general-sans)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-jeju-myeongjo)", "ui-serif", "Georgia"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      keyframes: {
        "skeleton-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "var(--pulse-min, 0.5)" },
        },
        // Never from nothing: the row starts at 96% and 6px low, not at zero.
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px) scale(0.96)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        "skeleton-pulse": "skeleton-pulse var(--pulse) ease-in-out var(--pulse-count, 1)",
      },
      colors: {
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        fg: "rgb(var(--color-fg) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
      },
    },
  },
  plugins: [],
} satisfies Config;
