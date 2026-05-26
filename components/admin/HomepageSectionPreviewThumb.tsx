import type { HomepageLayoutSectionDef } from "@/lib/homepageLayoutRegistry";

interface HomepageSectionPreviewThumbProps {
  section: HomepageLayoutSectionDef;
  className?: string;
}

/** CSS wireframe thumbnail mimicking each homepage section on the live page. */
export function HomepageSectionPreviewThumb({
  section,
  className = "",
}: HomepageSectionPreviewThumbProps) {
  return (
    <div
      className={`homepage-layout-thumb homepage-layout-thumb--${section.previewVariant} ${className}`.trim()}
      aria-hidden
    >
      <ThumbContent variant={section.previewVariant} />
    </div>
  );
}

function ThumbContent({
  variant,
}: {
  variant: HomepageLayoutSectionDef["previewVariant"];
}) {
  switch (variant) {
    case "hero":
      return (
        <>
          <span className="homepage-layout-thumb__hero-lines" />
          <span className="homepage-layout-thumb__hero-grid" />
        </>
      );
    case "life-grid":
      return (
        <div className="homepage-layout-thumb__life">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="homepage-layout-thumb__life-cell" />
          ))}
        </div>
      );
    case "offers":
      return (
        <div className="homepage-layout-thumb__offers">
          <span className="homepage-layout-thumb__offers-hero" />
          <div className="homepage-layout-thumb__offers-stack">
            <span />
            <span />
          </div>
        </div>
      );
    case "guided":
      return (
        <>
          <span className="homepage-layout-thumb__guided-title" />
          <div className="homepage-layout-thumb__guided-chips">
            <span />
            <span />
            <span />
          </div>
          <div className="homepage-layout-thumb__guided-cards">
            <span />
            <span />
          </div>
        </>
      );
    case "commitment":
      return (
        <div className="homepage-layout-thumb__commitment">
          <span />
          <span className="homepage-layout-thumb__commitment-center" />
          <span />
        </div>
      );
    case "social":
      return (
        <div className="homepage-layout-thumb__social">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>
      );
    case "brands":
      return (
        <div className="homepage-layout-thumb__brands">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>
      );
    case "scene":
      return <span className="homepage-layout-thumb__scene" />;
    case "footer":
      return (
        <div className="homepage-layout-thumb__footer">
          <span />
          <span />
          <span />
        </div>
      );
    default:
      return null;
  }
}
