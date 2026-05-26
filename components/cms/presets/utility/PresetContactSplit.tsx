/**
 * @preset contact_split
 */
import { FormPlaceholder } from "@/components/section-showcase/primitives/FormPlaceholder";
import { SectionEyebrow } from "@/components/section-showcase/primitives/SectionEyebrow";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import { cardMemo } from "@/lib/cardClasses";

const CONTACT_LINES = [
  { label: "Phone", value: "(555) 123-4567" },
  { label: "Email", value: "hello@example-dealer.com" },
  { label: "Hours", value: "Mon–Sat 8am–7pm" },
  { label: "Address", value: "1200 Coastal Hwy, Suite 100" },
];

export function PresetContactSplit({
  devLabel = "Contact 01 — Split info + form",
}: {
  devLabel?: string;
}) {
  return (
    <SectionShell pad="tight" devLabel={devLabel}>
      <header className="mb-10 max-w-xl">
        <SectionEyebrow className="mb-3">Contact</SectionEyebrow>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
          Reach our team
        </h2>
      </header>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
        <div className={`${cardMemo} space-y-6`}>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            Store details in a memo-style panel beside a message form.
          </p>
          <dl className="space-y-4">
            {CONTACT_LINES.map((line) => (
              <div key={line.label}>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {line.label}
                </dt>
                <dd className="mt-1 text-base font-medium text-[var(--ink)]">{line.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className={`${cardMemo} lg:py-10`}>
          <FormPlaceholder submitLabel="Send message" />
        </div>
      </div>
    </SectionShell>
  );
}
