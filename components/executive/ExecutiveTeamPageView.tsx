import Link from "next/link";
import { ExecutiveProfileCard } from "@/components/executive/ExecutiveProfileCard";
import { ExecutiveValuesBand } from "@/components/executive/ExecutiveValuesBand";
import {
  EXECUTIVE_TEAM_PAGE_CONTENT,
  type ExecutiveTeamPageContent,
} from "@/lib/executiveTeamPageContent";

import "@/app/executive-team-page.css";

interface ExecutiveTeamPageViewProps {
  content?: ExecutiveTeamPageContent;
}

export function ExecutiveTeamPageView({
  content = EXECUTIVE_TEAM_PAGE_CONTENT,
}: ExecutiveTeamPageViewProps) {
  const { intro, executives, leadershipMessage, cta } = content;

  return (
    <div className="executive-team-page">
      <section className="executive-team-intro" aria-labelledby="executive-team-intro-title">
        <div className="portal-container executive-team-intro__inner">
          <p className="executive-team-intro__eyebrow">
            <span className="executive-team-intro__eyebrow-line" aria-hidden />
            {intro.eyebrow}
            <span className="executive-team-intro__eyebrow-line" aria-hidden />
          </p>
          <h2 id="executive-team-intro-title" className="executive-team-intro__headline">
            {intro.headline}
          </h2>
          <p className="executive-team-intro__body">{intro.paragraph}</p>
        </div>
      </section>

      <section className="executive-team-grid-section" aria-label="Executive leadership team">
        <div className="portal-container">
          <ul className="executive-team-grid">
            {executives.map((executive) => (
              <li key={executive.id}>
                <ExecutiveProfileCard executive={executive} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ExecutiveValuesBand content={leadershipMessage} />

      <section className="executive-team-cta" aria-label="Get in touch">
        <div className="portal-container executive-team-cta__inner">
          <Link href={cta.primaryHref} className="executive-team-cta__btn executive-team-cta__btn--primary">
            {cta.primaryLabel}
          </Link>
          <Link
            href={cta.secondaryHref}
            className="executive-team-cta__btn executive-team-cta__btn--secondary"
          >
            {cta.secondaryLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
