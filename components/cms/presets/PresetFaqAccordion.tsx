/** @preset faq_accordion — saved */
import { Accordion } from "@/components/section-showcase/primitives/Accordion";
import { SectionEyebrow } from "@/components/section-showcase/primitives/SectionEyebrow";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";

const FAQ_ITEMS = [
  {
    question: "Can I schedule a test drive online?",
    answer:
      "Yes. Choose a vehicle, pick a store, and reserve a time. A specialist confirms details before you arrive.",
  },
  {
    question: "Do you offer trade-in appraisals?",
    answer:
      "We provide complimentary appraisals with transparent market-based estimates, valid for seven days.",
  },
  {
    question: "What financing options are available?",
    answer:
      "Lease, loan, and cash pathways are supported with on-site advisors who explain terms in plain language.",
  },
  {
    question: "Is service available at every location?",
    answer:
      "Most stores include full service lanes. Specialty work may route to a flagship center with shuttles.",
  },
  {
    question: "How does guided discovery work?",
    answer:
      "Answer a short lifestyle questionnaire and we surface vehicles that fit how you actually drive.",
  },
];

export function PresetFaqAccordion({
  devLabel = "Section 08 — Collapsible FAQ",
}: {
  devLabel?: string;
}) {
  return (
    <SectionShell className="bg-white" devLabel={devLabel}>
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 text-center sm:mb-12">
          <SectionEyebrow className="mb-4">FAQ</SectionEyebrow>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
            Questions we hear often
          </h2>
        </header>
        <Accordion items={FAQ_ITEMS} />
      </div>
    </SectionShell>
  );
}
