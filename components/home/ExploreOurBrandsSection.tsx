import { BrandLogoCarousel } from "@/components/home/BrandLogoCarousel";
import { EXPLORE_BRANDS } from "@/lib/exploreBrands";

/**
 * Cavender Auto Group brand showcase — not a dealership directory.
 */
export function ExploreOurBrandsSection() {
  return (
    <section
      id="explore-brands"
      className="scroll-mt-20 overflow-visible border-y border-[var(--line)] bg-white py-14 sm:py-20"
      aria-labelledby="explore-brands-heading"
    >
      <div className="portal-container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--muted)]">
            Cavender Auto Group
          </p>
          <h2
            id="explore-brands-heading"
            className="mt-3 headline-stack text-3xl text-[var(--ink)] sm:text-4xl"
          >
            Explore Our Brands
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            Access inventory across our entire network of trusted automotive brands.
          </p>
        </div>
      </div>

      <div className="mt-8 w-full sm:mt-10">
        <BrandLogoCarousel brands={EXPLORE_BRANDS} />
      </div>
    </section>
  );
}
