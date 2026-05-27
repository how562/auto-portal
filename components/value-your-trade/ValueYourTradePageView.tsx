import {
  VALUE_YOUR_TRADE_PAGE_CONTENT,
  type ValueYourTradePageContent,
} from "@/lib/valueYourTradePageContent";

import "@/app/value-your-trade-page.css";

interface ValueYourTradePageViewProps {
  content?: ValueYourTradePageContent;
}

export function ValueYourTradePageView({
  content = VALUE_YOUR_TRADE_PAGE_CONTENT,
}: ValueYourTradePageViewProps) {
  const { hero, iframe } = content;

  return (
    <div className="value-your-trade-page">
      <section className="vyt-hero" aria-labelledby="vyt-hero-title">
        <div className="vyt-hero__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero.imageUrl} alt="" className="vyt-hero__img" />
          <div className="vyt-hero__overlay" aria-hidden />
        </div>
        <div className="vyt-hero__content">
          <h1 id="vyt-hero-title" className="vyt-hero__title">
            {hero.title}
          </h1>
          <span className="vyt-hero__divider" aria-hidden />
          <p className="vyt-hero__tagline">
            {hero.tagline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>
      </section>

      <section className="vyt-embed" aria-label={iframe.title}>
        <div className="portal-container vyt-embed__inner">
          <iframe
            src={iframe.src}
            title={iframe.title}
            className="vyt-embed__frame"
            style={{ height: `${iframe.height}px` }}
          />
        </div>
      </section>
    </div>
  );
}
