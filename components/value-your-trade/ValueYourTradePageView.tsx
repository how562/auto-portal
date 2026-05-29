import { PageHeaderRenderer } from "@/components/page-headers/PageHeaderRenderer";
import {
  VALUE_YOUR_TRADE_PAGE_CONTENT,
  type ValueYourTradePageContent,
} from "@/lib/valueYourTradePageContent";
import { resolvePageHeader } from "@/lib/pageHeaderResolve";

import "@/app/value-your-trade-page.css";

interface ValueYourTradePageViewProps {
  content?: ValueYourTradePageContent;
}

export function ValueYourTradePageView({
  content = VALUE_YOUR_TRADE_PAGE_CONTENT,
}: ValueYourTradePageViewProps) {
  const { iframe } = content;
  const header = resolvePageHeader("value-your-trade", content);

  return (
    <div className="value-your-trade-page">
      <PageHeaderRenderer
        header={header}
        slots={{
          form: (
            <iframe
              src={iframe.src}
              title={iframe.title}
              className="vyt-embed__frame w-full rounded-lg border border-[var(--line)]"
              style={{ height: `${iframe.height}px` }}
            />
          ),
        }}
      />

      {!header || header.type !== "utility" || !header.utility.formSlot ? (
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
      ) : null}
    </div>
  );
}
