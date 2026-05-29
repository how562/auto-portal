import Link from "next/link";
import type { EditorialPageHeaderFields } from "@/lib/pageHeaderTypes";

export function EditorialPageHeader({ data }: { data: EditorialPageHeaderFields }) {
  const hasBannerImage = Boolean(data.image?.trim());
  const hasIntro = Boolean(
    data.introText?.trim() || data.eyebrow?.trim() || data.signatureText?.trim(),
  );
  const cta = data.primaryButtonLabel?.trim() && data.primaryButtonUrl?.trim();

  return (
    <header className="ph-editorial">
      <div className="ph-editorial__banner">
        {hasBannerImage ? (
          <div className="ph-editorial__banner-media" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.image} alt="" className="ph-editorial__banner-img" />
            <div className="ph-editorial__banner-overlay" />
          </div>
        ) : (
          <div
            className="ph-editorial__banner-media"
            style={{ background: "#2a2a2a" }}
            aria-hidden
          />
        )}
        <div className="ph-editorial__banner-content">
          <h1 id="page-header-title" className="ph-editorial__banner-title">
            {data.title}
          </h1>
        </div>
      </div>

      {hasIntro ? (
        <div className="ph-editorial__intro">
          <div className="portal-container ph-editorial__intro-grid">
            <div>
              {data.eyebrow ? (
                <p className="ph-editorial__eyebrow">{data.eyebrow}</p>
              ) : null}
              {data.introText ? (
                <p className="ph-editorial__intro-text">{data.introText}</p>
              ) : null}
              {data.signatureText ? (
                <p className="ph-editorial__signature">{data.signatureText}</p>
              ) : null}
              {cta ? (
                <div className="ph-editorial__cta">
                  <Link href={data.primaryButtonUrl} className="ph-editorial__cta-link">
                    {data.primaryButtonLabel}
                  </Link>
                </div>
              ) : null}
            </div>
            {hasBannerImage ? (
              <figure className="ph-editorial__figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.image} alt={data.imageAlt || ""} />
              </figure>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
