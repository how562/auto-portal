import Link from "next/link";
import type { UtilityPageHeaderFields } from "@/lib/pageHeaderTypes";

export interface UtilityPageHeaderProps {
  data: UtilityPageHeaderFields;
  slots?: {
    form?: React.ReactNode;
    tool?: React.ReactNode;
  };
}

export function UtilityPageHeader({ data, slots }: UtilityPageHeaderProps) {
  const primary = data.primaryButtonLabel?.trim() && data.primaryButtonUrl?.trim();
  const secondary =
    data.secondaryButtonLabel?.trim() && data.secondaryButtonUrl?.trim();
  const vehicle = data.vehicleImage?.trim();
  const formSlot =
    data.formSlot === "trade-iframe" ? slots?.form : data.formSlot ? slots?.form : null;
  const toolSlot = data.toolSlot ? slots?.tool : null;

  return (
    <header className="ph-utility">
      <div className="portal-container ph-utility__inner">
        <div>
          {data.eyebrow ? <p className="ph-utility__eyebrow">{data.eyebrow}</p> : null}
          <h1 id="page-header-title" className="ph-utility__title">
            {data.title}
          </h1>
          {data.introText ? (
            <p className="ph-utility__intro">{data.introText}</p>
          ) : null}
          {data.supportPoints.length > 0 ? (
            <ul className="ph-utility__points">
              {data.supportPoints.map((point) => (
                <li key={point} className="ph-utility__point">
                  {point}
                </li>
              ))}
            </ul>
          ) : null}
          {primary || secondary ? (
            <div className="ph-utility__actions">
              {primary ? (
                <Link
                  href={data.primaryButtonUrl}
                  className="ph-utility__btn ph-utility__btn--primary"
                >
                  {data.primaryButtonLabel}
                </Link>
              ) : null}
              {secondary ? (
                <Link
                  href={data.secondaryButtonUrl}
                  className="ph-utility__btn ph-utility__btn--secondary"
                >
                  {data.secondaryButtonLabel}
                </Link>
              ) : null}
            </div>
          ) : null}
          {formSlot || toolSlot ? (
            <div className="ph-utility__slot">{formSlot ?? toolSlot}</div>
          ) : null}
        </div>
        {vehicle ? (
          <div className="ph-utility__media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={vehicle} alt={data.vehicleImageAlt || ""} />
          </div>
        ) : null}
      </div>
    </header>
  );
}
