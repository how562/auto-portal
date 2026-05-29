import Link from "next/link";
import { CommitmentFeatureIconSvg } from "@/components/commitment/CommitmentIcons";
import { PageHeaderRenderer } from "@/components/page-headers/PageHeaderRenderer";
import { CommitmentMemoBackdrop } from "@/components/commitment/CommitmentMemoBackdrop";
import { CommitmentVeteransVideo } from "@/components/commitment/CommitmentVeteransVideo";
import {
  CAVENDER_COMMITMENT_PAGE_CONTENT,
  type CavenderCommitmentPageContent,
} from "@/lib/cavenderCommitmentPageContent";
import { btnSecondaryMd } from "@/lib/buttonClasses";
import { resolvePageHeader } from "@/lib/pageHeaderResolve";

import "@/app/cavender-commitment-page.css";

interface CavenderCommitmentPageViewProps {
  content?: CavenderCommitmentPageContent;
}

export function CavenderCommitmentPageView({
  content = CAVENDER_COMMITMENT_PAGE_CONTENT,
}: CavenderCommitmentPageViewProps) {
  const { hero, explanation, intro, veteransVideo, disclaimer } = content;

  const explanationParagraphs = [intro.body, hero.body].filter(Boolean);
  const header = resolvePageHeader("cavender-commitment", content);

  return (
    <div className="cc-page">
      <PageHeaderRenderer header={header} />

      <section className="cc-band cc-band--white" aria-labelledby="cc-explanation-title">
        <div className="portal-container cc-split">
          <div className="cc-split__copy">
            <p className="cc-eyebrow">{explanation.eyebrow}</p>
            <h2 id="cc-explanation-title" className="cc-headline">
              {explanation.headline}{" "}
              <span className="cc-headline-accent">{explanation.headlineAccent}</span>
            </h2>
            <div className="cc-body">
              {explanationParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
            <ul className="cc-highlights">
              {intro.features.map((feature) => (
                <li key={feature.id} className="cc-highlight">
                  <span className="cc-highlight__icon">
                    <CommitmentFeatureIconSvg type={feature.icon} />
                  </span>
                  <div>
                    <h3 className="cc-highlight__title">{feature.title}</h3>
                    <p className="cc-highlight__desc">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cc-inline-cta">
              <Link href={hero.primaryCta.href} className={btnSecondaryMd}>
                {hero.primaryCta.label}
              </Link>
            </div>
          </div>
          <div className="cc-split__media">
            <div className="cc-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={explanation.imageUrl} alt="" />
              <div className="cc-photo__fade" aria-hidden />
            </div>
          </div>
        </div>
      </section>

      <section
        className="cc-band cc-band--gradient"
        aria-labelledby="cc-video-title"
        id={veteransVideo.sectionId}
      >
        <div className="cc-band__ambience" aria-hidden>
          <CommitmentMemoBackdrop fixed={false} />
        </div>
        <div className="portal-container cc-video-section">
          <CommitmentVeteransVideo
            sectionId={veteransVideo.sectionId}
            eyebrow={veteransVideo.eyebrow}
            headline={veteransVideo.headline}
            body={veteransVideo.body}
            videoUrl={veteransVideo.videoUrl}
            posterUrl={veteransVideo.posterUrl}
          />
        </div>
      </section>

      <section className="cc-band cc-band--disclaimer" aria-labelledby="cc-disclaimer-title">
        <div className="portal-container cc-disclaimer">
          <p className="cc-disclaimer__eyebrow">Disclaimer</p>
          <h2 id="cc-disclaimer-title" className="cc-disclaimer__headline">
            {disclaimer.headline}
          </h2>
          <div className="cc-disclaimer__body">
            {disclaimer.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

