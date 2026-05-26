/** @preset cta_banner — saved */
import { CTAButtons } from "@/components/section-showcase/primitives/CTAButtons";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";

export function PresetCtaBanner({ devLabel = "Section 09 — CTA Banner" }: { devLabel?: string }) {
  return (
    <SectionShell pad="tight" fullBleed devLabel={devLabel}>
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-[var(--navy-deep)] via-[var(--charcoal)] to-[var(--ink)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent, transparent 48px, rgba(255,255,255,0.03) 48px, rgba(255,255,255,0.03) 96px)",
          }}
          aria-hidden
        />
        <div className="portal-container relative py-20 text-center sm:py-24 lg:py-28">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to find your next vehicle?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Strong conversion band with gradient placeholder standing in for photography.
          </p>
          <CTAButtons
            className="mt-10 justify-center"
            buttons={[
              { label: "Shop inventory", href: "/inventory", variant: "light" },
              { label: "Contact a store", href: "#", variant: "on_dark" },
            ]}
          />
        </div>
      </div>
    </SectionShell>
  );
}
