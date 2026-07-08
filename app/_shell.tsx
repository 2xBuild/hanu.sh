import type { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16 sm:py-24">
      {children}
    </main>
  );
}

export function SectionTitle({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="mt-16">
      <h2 className="inline-flex items-center rounded-full bg-white/[0.06] px-4 py-2 font-serif text-[clamp(1.15rem,2.3vw,1.5rem)] font-normal leading-none tracking-[-0.02em] text-fg/95 ring-1 ring-white/12">
        {children}
      </h2>
    </div>
  );
}
