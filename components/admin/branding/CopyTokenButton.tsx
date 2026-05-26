"use client";

import { useCallback, useState } from "react";

interface CopyTokenButtonProps {
  value: string;
  label?: string;
}

export function CopyTokenButton({ value, label = "Copy" }: CopyTokenButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={onCopy}
      className="rounded-md border border-[var(--line)] bg-white px-2 py-1 text-[11px] font-semibold text-[var(--ink)] transition hover:bg-[var(--cream)]"
      title={`Copy ${value}`}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
