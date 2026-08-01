"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function ComponentCard({
  name,
  source,
  children,
}: {
  name: string;
  source: string;
  children: ReactNode;
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
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between px-4 py-2.5">
        <h2 className="text-xs font-medium text-slate-600">{name}</h2>

        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy code"}
          title={copied ? "Copied" : "Copy code"}
          className="grid size-7 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 active:scale-90"
        >
          {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
        </button>
      </header>

      <div className="relative aspect-video bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50">
        {children}
      </div>
    </section>
  );
}
