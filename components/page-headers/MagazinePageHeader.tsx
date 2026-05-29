import Link from "next/link";
import { CavenderLogo } from "@/components/brand/CavenderLogo";
import type { MagazinePageHeaderFields } from "@/lib/pageHeaderTypes";

export function MagazinePageHeader({ data }: { data: MagazinePageHeaderFields }) {
  const dark = data.darkMode !== false;

  return (
    <header
      className={`ph-magazine ${dark ? "ph-magazine--dark" : "ph-magazine--light"}`}
    >
      <div className="ph-magazine__logo-row">
        <span className="ph-magazine__line" aria-hidden />
        <div className="ph-magazine__logo">
          {data.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.logoUrl} alt={data.logoText || "Cavender"} />
          ) : data.logoText ? (
            <span className="ph-magazine__logo-text">{data.logoText}</span>
          ) : (
            <CavenderLogo href="/" size="hero" variant={dark ? "light" : "dark"} />
          )}
        </div>
        <span className="ph-magazine__line" aria-hidden />
      </div>

      {data.eyebrow ? <p className="ph-magazine__eyebrow">{data.eyebrow}</p> : null}
      <h1 id="page-header-title" className="ph-magazine__title">
        {data.title}
      </h1>
      {data.subtitle ? (
        <p className="ph-magazine__subtitle">{data.subtitle}</p>
      ) : null}

      {data.categoryLinks.length > 0 ? (
        <ul className="ph-magazine__nav">
          {data.categoryLinks.map((link) => (
            <li key={`${link.href}-${link.label}`}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      ) : null}
    </header>
  );
}
