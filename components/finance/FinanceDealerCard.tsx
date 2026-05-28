import type { FinanceDealerCard as FinanceDealerCardData } from "@/lib/financePageContent";

interface FinanceDealerCardProps {
  dealer: FinanceDealerCardData;
}

export function FinanceDealerCard({ dealer }: FinanceDealerCardProps) {
  return (
    <article
      className="finance-dealer-card"
      aria-labelledby={`finance-dealer-${dealer.id}`}
    >
      <div className="finance-dealer-card__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dealer.imageUrl} alt="" className="finance-dealer-card__img" />
      </div>
      <div className="finance-dealer-card__body">
        <h2 id={`finance-dealer-${dealer.id}`} className="finance-dealer-card__name">
          {dealer.name}
        </h2>
        <p className="finance-dealer-card__region">{dealer.cityRegion}</p>
        <a
          href={dealer.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="finance-dealer-card__cta"
        >
          {dealer.buttonLabel}
        </a>
      </div>
    </article>
  );
}
