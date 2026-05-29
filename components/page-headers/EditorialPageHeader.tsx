import Link from "next/link";
import type { EditorialPageHeaderFields } from "@/lib/pageHeaderTypes";

export function EditorialPageHeader({ data }: { data: EditorialPageHeaderFields }) {
  const cta = data.primaryButtonLabel?.trim() && data.primaryButtonUrl?.trim();
  const categories = (data.categoryLabels ?? []).filter((label) => label.trim());

  return (
    <header className="ph-editorial" aria-labelledby="page-header-title">
      <div className="ph-editorial__texture" aria-hidden />
      <div className="portal-container ph-editorial__inner">
        <div className="ph-editorial__grid">
          <div className="ph-editorial__lead">
            <span className="ph-editorial__rule ph-editorial__rule--accent" aria-hidden />
            {data.eyebrow ? (
              <p className="ph-editorial__eyebrow">{data.eyebrow}</p>
            ) : null}
            <h1 id="page-header-title" className="ph-editorial__title">
              {data.title}
            </h1>
          </div>

          <div className="ph-editorial__statement">
            {data.introText ? (
              <p className="ph-editorial__statement-text">{data.introText}</p>
            ) : null}
            {data.signatureText ? (
              <p className="ph-editorial__signature">{data.signatureText}</p>
            ) : null}
            {cta ? (
              <Link href={data.primaryButtonUrl} className="ph-editorial__cta">
                {data.primaryButtonLabel}
              </Link>
            ) : null}
          </div>
        </div>

        {categories.length > 0 ? (
          <ul className="ph-editorial__categories" aria-label="Topics">
            {categories.map((label) => (
              <li key={label} className="ph-editorial__category">
                {label}
              </li>
            ))}
          </ul>
        ) : null}

        <span className="ph-editorial__rule ph-editorial__rule--foot" aria-hidden />
      </div>
    </header>
  );
}
