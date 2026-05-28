import type {
  CommitmentBenefitIcon,
  CommitmentFeatureIcon,
} from "@/lib/cavenderCommitmentPageContent";

const iconClass = "cc-icon";

export function CommitmentFeatureIconSvg({ type }: { type: CommitmentFeatureIcon }) {
  switch (type) {
    case "oil":
      return (
        <svg className={iconClass} viewBox="0 0 48 48" fill="none" aria-hidden>
          <path
            d="M14 18h20v22H14V18z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M18 18V12a6 6 0 0112 0v6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path d="M20 28h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "shield":
      return (
        <svg className={iconClass} viewBox="0 0 48 48" fill="none" aria-hidden>
          <path
            d="M24 6L10 12v10c0 9 6 14 14 18 8-4 14-9 14-18V12L24 6z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M24 20v8M24 16v.01"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case "location":
      return (
        <svg className={iconClass} viewBox="0 0 48 48" fill="none" aria-hidden>
          <path
            d="M24 8c-6 0-10 5-10 11 0 8 10 17 10 17s10-9 10-17c0-6-4-11-10-11z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="19" r="4" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      );
    case "community":
      return (
        <svg className={iconClass} viewBox="0 0 48 48" fill="none" aria-hidden>
          <circle cx="18" cy="16" r="5" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="32" cy="18" r="4" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M8 36c0-5 4-8 10-8s10 3 10 8M26 36c0-4 3-7 8-7"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

export function CommitmentBenefitIconSvg({ type }: { type: CommitmentBenefitIcon }) {
  switch (type) {
    case "oil-life":
      return <CommitmentFeatureIconSvg type="oil" />;
    case "locations":
      return <CommitmentFeatureIconSvg type="location" />;
    case "service":
      return (
        <svg className={iconClass} viewBox="0 0 48 48" fill="none" aria-hidden>
          <path
            d="M16 20l4-8h8l4 8v16H16V20z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="30" r="4" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      );
    case "confidence":
      return (
        <svg className={iconClass} viewBox="0 0 48 48" fill="none" aria-hidden>
          <path
            d="M24 8l4 8h9l-7 6 3 9-9-5-9 5 3-9-7-6h9l4-8z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

export function CommitmentHonorIconSvg({
  type,
}: {
  type: "military" | "texas-valor" | "giving-back";
}) {
  switch (type) {
    case "military":
      return <CommitmentFeatureIconSvg type="shield" />;
    case "texas-valor":
      return (
        <svg className={iconClass} viewBox="0 0 48 48" fill="none" aria-hidden>
          <path
            d="M24 6l3 9h9l-7 6 3 9-8-5-8 5 3-9-7-6h9l3-9z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "giving-back":
      return <CommitmentFeatureIconSvg type="community" />;
    default:
      return null;
  }
}

export function CommitmentFooterIconSvg({
  type,
}: {
  type: "texas" | "since" | "community";
}) {
  switch (type) {
    case "texas":
      return (
        <svg className={iconClass} viewBox="0 0 48 48" fill="none" aria-hidden>
          <path
            d="M24 8c-8 4-14 12-14 20 0 6 6 12 14 12s14-6 14-12c0-8-6-16-14-20z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      );
    case "since":
      return (
        <svg className={iconClass} viewBox="0 0 48 48" fill="none" aria-hidden>
          <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1.5" />
          <path d="M24 14v10l6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "community":
      return <CommitmentFeatureIconSvg type="community" />;
    default:
      return null;
  }
}

export function CommitmentStarDivider() {
  return (
    <span className="cc-star-divider" aria-hidden>
      <span className="cc-star-divider__line" />
      <svg className="cc-star-divider__star" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L6 21l2.3-7-6-4.6h7.6L12 2z" />
      </svg>
      <span className="cc-star-divider__line" />
    </span>
  );
}
