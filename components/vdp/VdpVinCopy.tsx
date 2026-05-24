"use client";

import { useCallback, useState } from "react";

interface VdpVinCopyProps {
  vin: string;
}

export function VdpVinCopy({ vin }: VdpVinCopyProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(vin);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [vin]);

  return (
    <button
      type="button"
      onClick={copy}
      className="group inline-flex max-w-full items-center gap-1.5 rounded-md border border-transparent px-1 py-0.5 font-mono text-[11px] uppercase tracking-wider text-[var(--muted)] transition hover:border-[var(--line)] hover:bg-[var(--cream)] hover:text-[var(--ink)]"
      title="Copy VIN"
    >
      <span className="truncate">{vin}</span>
      <span className="shrink-0 text-[9px] font-semibold normal-case tracking-normal text-[var(--gold)] opacity-0 transition group-hover:opacity-100">
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}
