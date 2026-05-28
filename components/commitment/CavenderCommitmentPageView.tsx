import Image from "next/image";
import Link from "next/link";
import { CommitmentFeatureIconSvg } from "@/components/commitment/CommitmentIcons";
import { CommitmentMemoBackdrop } from "@/components/commitment/CommitmentMemoBackdrop";
import { CommitmentVeteransVideo } from "@/components/commitment/CommitmentVeteransVideo";
import {
  CAVENDER_COMMITMENT_PAGE_CONTENT,
  type CavenderCommitmentPageContent,
} from "@/lib/cavenderCommitmentPageContent";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

import "@/app/cavender-commitment-page.css";

const COMMITMENT_LOGO = "/brand/cavender-commitment.png";

interface CavenderCommitmentPageViewProps {
  content?: CavenderCommitmentPageContent;
}

export function CavenderCommitmentPageView({
  content = CAVENDER_COMMITMENT_PAGE_CONTENT,
}: CavenderCommitmentPageViewProps) {
  const { memo, hero, explanation, intro, veteransVideo, disclaimer } = content;

  const explanationParagraphs = [intro.body, hero.body].filter(Boolean);

  return (
    <div className="cc-page">
      <section className="cc-hero" aria-labelledby="cc-hero-title">
        <div className="cc-hero__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero.imageUrl} alt="" className="cc-hero__img" />
          <div className="cc-hero__overlay" aria-hidden />
          <div className="cc-hero__fade" aria-hidden />
        </div>
        <div className="cc-hero__content">
          <p className="cc-hero__badge">{memo.classification}</p>
          <Image
            src={COMMITMENT_LOGO}
            alt="Cavender Commitment"
            width={1177}
            height={217}
            className="cc-hero__logo"
            priority
          />
          <h1 id="cc-hero-title" className="cc-hero__title">
            {hero.headlineLine1}
            <span className="cc-hero__title-line"> {hero.headlineLine2}</span>
          </h1>
          <span className="cc-hero__divider" aria-hidden />
          {hero.headlineAccent ? (
            <p className="cc-hero__tagline">{hero.headlineAccent}</p>
          ) : null}
          <div className="cc-hero__actions">
            <Link href={hero.primaryCta.href} className={btnPrimaryMd}>
              {hero.primaryCta.label}
            </Link>
            <HeroSecondaryCta href={hero.secondaryCta.href} label={hero.secondaryCta.label} />
          </div>
        </div>
      </section>

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

function HeroSecondaryCta({ href, label }: { href: string; label: string }) {
  const className = `${btnSecondaryMd} cc-hero__btn-secondary`;
  if (href.startsWith("#")) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}
