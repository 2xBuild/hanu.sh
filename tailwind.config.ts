import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-general-sans)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-jeju-myeongjo)", "ui-serif", "Georgia"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
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
