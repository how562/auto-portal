import Link from "next/link";
import type { CinematicPageHeaderFields } from "@/lib/pageHeaderTypes";

export function CinematicPageHeader({ data }: { data: CinematicPageHeaderFields }) {
  const overlay = Math.min(100, Math.max(0, data.overlayOpacity ?? 45)) / 100;
  const hasMobile = Boolean(data.mobileBackgroundImage?.trim());
  const primary = data.primaryButtonLabel?.trim() && data.primaryButtonUrl?.trim();
  const secondary =
    data.secondaryButtonLabel?.trim() && data.secondaryButtonUrl?.trim();

  return (
    <section className="ph-cinematic" aria-labelledby="page-header-title">
      <div className="ph-cinematic__media" aria-hidden>
        {data.backgroundImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.backgroundImage}
              alt=""
              className={`ph-cinematic__img ph-cinematic__img--desktop ${
                hasMobile ? "ph-cinematic__img--has-mobile" : ""
              }`}
            />
            {hasMobile ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.mobileBackgroundImage}
                alt=""
                className="ph-cinematic__img ph-cinematic__img--mobile"
              />
            ) : null}
          </>
        ) : (
          <div className="ph-cinematic__img" style={{ background: "#1a1a1a" }} />
        )}
        <div
          className="ph-cinematic__overlay"
          style={{ opacity: overlay }}
        />
      </div>

      <div className="ph-cinematic__content">
        {data.logoImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.logoImageUrl}
            alt={data.logoAlt || ""}
            className="ph-cinematic__logo"
          />
        ) : null}
        {data.eyebrow ? <p className="ph-cinematic__eyebrow">{data.eyebrow}</p> : null}
        <h1 id="page-header-title" className="ph-cinematic__title">
          {data.title}
        </h1>
        <span className="ph-cinematic__divider" aria-hidden />
        {data.subtitle ? (
          <p className="ph-cinematic__subtitle">{data.subtitle}</p>
        ) : null}
        {primary || secondary ? (
          <div className="ph-cinematic__actions">
            {primary ? (
              <Link
                href={data.primaryButtonUrl}
                className="ph-cinematic__btn ph-cinematic__btn--primary"
              >
                {data.primaryButtonLabel}
              </Link>
            ) : null}
            {secondary ? (
              <Link
                href={data.secondaryButtonUrl}
                className="ph-cinematic__btn ph-cinematic__btn--secondary"
              >
                {data.secondaryButtonLabel}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
