import { BrandLogoCarousel } from "@/components/home/BrandLogoCarousel";
import { EXPLORE_BRANDS } from "@/lib/exploreBrands";

/**
 * Cavender Auto Group brand showcase — not a dealership directory.
 */
export function ExploreOurBrandsSection() {
  return (
    <section
      id="explore-brands"
      className="homepage-brands scroll-mt-20 overflow-visible"
      aria-labelledby="explore-brands-heading"
    >
      <div className="portal-container">
        <div className="homepage-brands__header text-center">
          <p className="homepage-brands__eyebrow font-semibold uppercase text-[var(--muted)]">
            Cavender Auto Group
          </p>
          <h2
            id="explore-brands-heading"
            className="homepage-brands__title headline-stack font-semibold text-[var(--ink)]"
          >
            Explore Our Brands
          </h2>
          <p className="homepage-brands__lead text-[var(--muted)]">
            Shop every brand in our network from one place.
          </p>
        </div>

        <div className="homepage-brands__marquee-slot w-full">
          <BrandLogoCarousel brands={EXPLORE_BRANDS} />
        </div>
      </div>
    </section>
  );
}
