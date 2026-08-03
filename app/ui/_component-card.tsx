"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function ComponentCard({
  name,
  source,
  children,
  demoClassName = "aspect-video",
}: {
  name: string;
  source: string;
  children: ReactNode;
  /** Overrides the default 16:9 preview container — pass any height/aspect class. */
  demoClassName?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(source);
    } catch {
      return;
    }

    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-transparent transition-colors duration-300">
      <header className="flex items-center justify-between px-4 py-2.5">
        <h2 className="text-xs font-medium text-muted transition-colors duration-300">{name}</h2>

        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy code"}
          title={copied ? "Copied" : "Copy code"}
          className="grid size-7 place-items-center rounded-md text-muted transition hover:bg-surface/5 hover:text-fg active:scale-90"
        >
          {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
        </button>
      </header>

      <div className={`relative bg-transparent ${demoClassName}`}>
        {children}
      </div>
    </section>
  );
}
