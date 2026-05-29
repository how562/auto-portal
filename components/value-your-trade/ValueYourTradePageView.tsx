import {
  VALUE_YOUR_TRADE_PAGE_CONTENT,
  type ValueYourTradePageContent,
} from "@/lib/valueYourTradePageContent";
import { resolveValueYourTradeUtilityHeader } from "@/lib/pageHeaderResolve";

import "@/app/value-your-trade-page.css";

interface ValueYourTradePageViewProps {
  content?: ValueYourTradePageContent;
}

export function ValueYourTradePageView({
  content = VALUE_YOUR_TRADE_PAGE_CONTENT,
}: ValueYourTradePageViewProps) {
  const { iframe } = content;
  const intro = resolveValueYourTradeUtilityHeader(content);

  return (
    <div className="value-your-trade-page">
      <section className="vyt-utility" aria-labelledby="vyt-utility-title">
        <div className="portal-container vyt-utility__inner">
          {intro.eyebrow ? <p className="vyt-utility__eyebrow">{intro.eyebrow}</p> : null}
          <h1 id="vyt-utility-title" className="vyt-utility__title">
            {intro.title}
          </h1>
          {intro.introText ? (
            <p className="vyt-utility__intro">{intro.introText}</p>
          ) : null}
        </div>
      </section>

      <div className="vyt-page-divider" role="separator" aria-hidden />

      <section className="vyt-embed" aria-label={iframe.title}>
        <iframe
          src={iframe.src}
          title={iframe.title}
          className="vyt-embed__frame"
          style={{ height: `${iframe.height}px` }}
        />
      </section>
    </div>
  );
}
