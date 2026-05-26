/**
 * @preset form_lead — centered lead form card (CMS form pattern)
 */
import {
  FormPlaceholder,
  FormPlaceholderCard,
} from "@/components/section-showcase/primitives/FormPlaceholder";
import { SectionEyebrow } from "@/components/section-showcase/primitives/SectionEyebrow";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";

export function PresetFormLead({
  devLabel = "Form 01 — Lead capture card",
}: {
  devLabel?: string;
}) {
  return (
    <SectionShell pad="tight" devLabel={devLabel}>
      <FormPlaceholderCard>
        <div className="text-center">
          <SectionEyebrow className="mb-3">Connect</SectionEyebrow>
          <h2 className="headline-stack text-3xl text-[var(--ink)] sm:text-4xl">
            Let us curate your shortlist
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[var(--muted)]">
            Matches the live CMS form section — headline stack above a full contact form.
          </p>
        </div>
        <div className="mt-10 text-left">
          <FormPlaceholder submitLabel="Get started" />
        </div>
      </FormPlaceholderCard>
    </SectionShell>
  );
}
