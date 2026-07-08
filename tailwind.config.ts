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
        bg: "#0a0a0a",
        fg: "#e6e6e6",
        muted: "#8a8a8a",
        line: "#2a2a2a",
      },
    },
  },
  plugins: [],
} satisfies Config;
