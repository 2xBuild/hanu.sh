"use client";

import { useState } from "react";
import { DomainFallbackIcon } from "./_icons";

type SiteLogoProps = {
  src?: string;
  name: string;
  className?: string;
};

export function SiteLogo({ src, name, className = "" }: SiteLogoProps) {
  const [hasError, setHasError] = useState(false);
  const resolvedClassName = `h-4 w-4 shrink-0 rounded-[4px] object-contain ${className}`.trim();

  if (!src || hasError) {
    return (
      <span
        aria-label={`${name} logo fallback`}
        className={`inline-flex items-center justify-center bg-fg/6 text-fg/55 ${resolvedClassName}`}
      >
        <DomainFallbackIcon className="h-[70%] w-[70%]" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={`${name} logo`}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
      className={resolvedClassName}
    />
  );
}
