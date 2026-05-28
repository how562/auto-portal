import { CavenderLogo } from "@/components/brand/CavenderLogo";
import type { StoriesPageMeta } from "@/lib/storiesContent";

export function StoriesMasthead({ meta }: { meta: StoriesPageMeta }) {
  return (
    <header className="stories-masthead">
      <div className="stories-masthead__logo-row">
        <span className="stories-masthead__line" aria-hidden />
        <div className="stories-masthead__logo flex justify-center">
          <CavenderLogo href="/" size="hero" variant="light" />
        </div>
        <span className="stories-masthead__line" aria-hidden />
      </div>
      <h1 className="stories-masthead__title">{meta.title}</h1>
      {meta.subtitle ? <p className="stories-masthead__subtitle">{meta.subtitle}</p> : null}
    </header>
  );
}
