import { PageHeaderRenderer } from "@/components/page-headers/PageHeaderRenderer";
import { FINANCE_PAGE_CONTENT } from "@/lib/financePageContent";
import type { FinancePageContent } from "@/lib/financePageContent";
import { resolvePageHeader } from "@/lib/pageHeaderResolve";
import { FinanceDealerCard } from "@/components/finance/FinanceDealerCard";
import { FinanceFeatureBand } from "@/components/finance/FinanceFeatureBand";

import "@/app/finance-page.css";

interface FinancePageViewProps {
  content?: FinancePageContent;
}

export function FinancePageView({
  content = FINANCE_PAGE_CONTENT,
}: FinancePageViewProps) {
  const header = resolvePageHeader("finance-center", content);

  return (
    <div className="finance-page">
      <PageHeaderRenderer header={header} />

      <section className="finance-intro" aria-labelledby="finance-intro-title">
        <div className="portal-container finance-intro__inner">
          <p className="finance-intro__eyebrow">{content.intro.eyebrow}</p>
          <h2 id="finance-intro-title" className="finance-intro__heading">
            {content.intro.heading}
          </h2>
          <p className="finance-intro__body">{content.intro.body}</p>
        </div>
      </section>

      <section
        id="finance-dealers"
        className="finance-dealers-section"
        aria-label="Dealership finance applications"
      >
        <div className="portal-container">
          {content.dealers.length === 0 ? (
            <p className="finance-dealers-section__empty">
              Finance applications are being updated. Please check back soon.
            </p>
          ) : (
            <ul className="finance-dealers-grid">
              {content.dealers.map((dealer) => (
                <li key={dealer.id}>
                  <FinanceDealerCard dealer={dealer} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <FinanceFeatureBand features={content.features} />

      <section className="finance-cta" aria-labelledby="finance-cta-title">
        <div className="portal-container finance-cta__inner">
          <h2 id="finance-cta-title" className="finance-cta__heading">
            {content.cta.heading}
          </h2>
          <div className="finance-cta__actions">
            <a href={content.cta.locationsHref} className="finance-cta__btn finance-cta__btn--primary">
              {content.cta.locationsLabel}
            </a>
            <a href={content.cta.shopHref} className="finance-cta__btn finance-cta__btn--secondary">
              {content.cta.shopLabel}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
