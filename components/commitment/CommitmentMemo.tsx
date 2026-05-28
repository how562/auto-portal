import type { ReactNode } from "react";
import { CommitmentMemoWatermark } from "@/components/commitment/CommitmentMemoBackdrop";

export function CommitmentMemoDocument({ children }: { children: ReactNode }) {
  return (
    <article className="cc-memo" aria-label="Cavender Commitment mission report">
      <div className="cc-memo__paper">
        <CommitmentMemoWatermark className="cc-memo__watermark" />
        {children}
      </div>
    </article>
  );
}

export function CommitmentMemoCover({
  classification,
  documentId,
  subject,
  logo,
}: {
  classification: string;
  documentId: string;
  subject: string;
  logo: ReactNode;
}) {
  return (
    <header className="cc-memo__cover">
      <div className="cc-memo__cover-top">
        <span className="cc-memo__classification">{classification}</span>
        <span className="cc-memo__doc-id">{documentId}</span>
      </div>
      <div className="cc-memo__stamp" aria-hidden>
        MISSION
        <br />
        REPORT
      </div>
      <div className="cc-memo__logo">{logo}</div>
      <h1 className="cc-memo__subject">{subject}</h1>
    </header>
  );
}

export function CommitmentMemoMeta({
  rows,
}: {
  rows: { label: string; value: string }[];
}) {
  return (
    <dl className="cc-memo__meta">
      {rows.map((row) => (
        <div key={row.label} className="cc-memo__meta-row">
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function CommitmentMemoSection({
  id,
  code,
  title,
  children,
  variant = "default",
}: {
  id?: string;
  code: string;
  title: string;
  children: ReactNode;
  variant?: "default" | "dark" | "intel";
}) {
  return (
    <section
      id={id}
      className={`cc-memo-section cc-memo-section--${variant}`}
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <div className="cc-memo-section__head">
        <span className="cc-memo-section__code">{code}</span>
        <h2 id={id ? `${id}-title` : undefined} className="cc-memo-section__title">
          {title}
        </h2>
      </div>
      <div className="cc-memo-section__body">{children}</div>
    </section>
  );
}

export function CommitmentIntelGrid({
  preparedBy,
  intro,
  items,
}: {
  preparedBy: string;
  intro: string;
  items: {
    id: string;
    figureLabel: string;
    imageUrl: string;
    caption: string;
    location?: string;
  }[];
}) {
  return (
    <div className="cc-intel">
      {preparedBy ? <p className="cc-intel__byline">{preparedBy}</p> : null}
      {intro ? <p className="cc-intel__intro">{intro}</p> : null}
      <ul className="cc-intel__grid">
        {items.map((item) => (
          <li key={item.id} className="cc-intel__item">
            <figure className="cc-intel__figure">
              <div className="cc-intel__photo-wrap">
                <span className="cc-intel__tape cc-intel__tape--left" aria-hidden />
                <span className="cc-intel__tape cc-intel__tape--right" aria-hidden />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt="" className="cc-intel__photo" />
                <span className="cc-intel__figure-label">{item.figureLabel}</span>
              </div>
              <figcaption className="cc-intel__caption">
                {item.caption}
                {item.location ? (
                  <span className="cc-intel__location"> — {item.location}</span>
                ) : null}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
