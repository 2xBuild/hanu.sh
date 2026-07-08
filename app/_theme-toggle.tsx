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
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="rounded-full transition-transform duration-200 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-fg/20 focus:ring-offset-2 focus:ring-offset-bg"
    >
      <Image
        src="/image.png"
        alt="Hanu"
        width={44}
        height={44}
        className="h-11 w-11 rounded-full object-cover ring-1 ring-line"
      />
    </button>
  );
}
