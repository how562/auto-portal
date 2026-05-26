/** This component reads from global design tokens. Update tokens in globals.css to apply changes site-wide. */

import { DEALERSHIP_COMPLIANCE_NOTICE } from "@/lib/brandingHub";

export function DealershipComplianceNotice() {
  return (
    <p
      className="rounded-lg border border-[var(--line)] bg-[var(--cream)] px-4 py-3 text-sm leading-relaxed text-[var(--ink)]"
      role="note"
    >
      {DEALERSHIP_COMPLIANCE_NOTICE}
    </p>
  );
}
