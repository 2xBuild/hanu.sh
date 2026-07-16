"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function ThemeToggleAvatar() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY);

    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
      applyTheme(savedTheme);
      return;
    }

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    setTheme(systemTheme);
    applyTheme(systemTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="relative h-11 w-11 shrink-0 select-none overflow-hidden rounded-full ring-1 ring-line transition-transform duration-200 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-fg/20 focus:ring-offset-2 focus:ring-offset-bg"
    >
      {/* Decorative only — no extractable handle for casual drag / open-image */}
      <Image
        src="/me.png"
        alt=""
        fill
        sizes="44px"
        draggable={false}
        className="pointer-events-none object-cover select-none [-webkit-user-drag:none]"
      />
      {/* Captures pointer so the underlying img can't be dragged or long-pressed for a URL */}
      <span
        aria-hidden
        className="absolute inset-0 z-10 select-none"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
    </button>
  );
}
