import type { FinancePageFeature } from "@/lib/financePageContent";

function FinanceFeatureIcon({ type }: { type: FinancePageFeature["icon"] }) {
  const className = "finance-feature-band__icon";
  switch (type) {
    case "application":
      return (
        <span className={className} aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
          </svg>
        </span>
      );
    case "locations":
      return (
        <span className={className} aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path
              d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="11" r="2.25" />
          </svg>
        </span>
      );
    case "flexible":
      return (
        <span className={className} aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 8h16M4 16h10" strokeLinecap="round" />
            <path d="M16 14l4 2-4 2v-4z" strokeLinejoin="round" />
          </svg>
        </span>
      );
    case "support":
      return (
        <span className={className} aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path
              d="M12 3a7 7 0 00-4 12.7V19a1 1 0 001 1h6a1 1 0 001-1v-3.3A7 7 0 0012 3z"
              strokeLinejoin="round"
            />
            <path d="M9 21h6" strokeLinecap="round" />
          </svg>
        </span>
      );
    default:
      return null;
  }
}

interface FinanceFeatureBandProps {
  features: FinancePageFeature[];
}

export function FinanceFeatureBand({ features }: FinanceFeatureBandProps) {
  return (
    <section className="finance-feature-band" aria-label="Finance benefits">
      <div className="portal-container">
        <ul className="finance-feature-band__list">
          {features.map((feature) => (
            <li key={feature.id} className="finance-feature-band__item">
              <FinanceFeatureIcon type={feature.icon} />
              <h3 className="finance-feature-band__title">{feature.title}</h3>
              <p className="finance-feature-band__desc">{feature.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
