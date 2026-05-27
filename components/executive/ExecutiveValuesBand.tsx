import { ExecutiveValueIcon } from "@/components/executive/ExecutiveValueIcons";
import type { ExecutiveTeamPageContent } from "@/lib/executiveTeamPageContent";

interface ExecutiveValuesBandProps {
  content: ExecutiveTeamPageContent["leadershipMessage"];
}

export function ExecutiveValuesBand({ content }: ExecutiveValuesBandProps) {
  return (
    <section className="executive-team-values" aria-labelledby="executive-team-values-title">
      <div className="portal-container executive-team-values__inner">
        <div className="executive-team-values__copy">
          <p className="executive-team-values__eyebrow">{content.eyebrow}</p>
          <h2 id="executive-team-values-title" className="executive-team-values__headline">
            {content.headline}
          </h2>
          <p className="executive-team-values__body">{content.body}</p>
        </div>
        <ul className="executive-team-values__grid">
          {content.values.map((value, index) => (
            <li
              key={value.id}
              className={`executive-team-values__item${
                index % 2 === 1 ? " executive-team-values__item--col-divider" : ""
              }`}
            >
              <ExecutiveValueIcon type={value.icon} />
              <h3 className="executive-team-values__item-title">{value.title}</h3>
              <p className="executive-team-values__item-desc">{value.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
