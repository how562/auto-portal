import type { HalfHalfBlockProps } from "@/lib/halfHalfSection";

import "@/app/page-headers.css";
import "@/app/half-half-section.css";

export function HalfHalfBlock({
  eyebrow,
  title,
  titleLine2,
  introText,
  signatureText,
  image,
  imageAlt = "",
  imagePosition = "right",
  variant = "default",
  as = "section",
  headingLevel,
  headingId,
  className = "",
}: HalfHalfBlockProps) {
  const paragraphs = (introText ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const Wrapper = as === "header" ? "header" : "section";
  const titleId = headingId ?? "half-half-title";
  const TitleTag = headingLevel ?? (as === "header" ? "h1" : "h2");

  return (
    <Wrapper
      className={`ph-split half-half-block half-half-block--${variant} ${className}`.trim()}
      aria-labelledby={title ? titleId : undefined}
    >
      <div
        className={`ph-split__grid${imagePosition === "left" ? " ph-split__grid--image-left" : ""}`}
      >
        <div className="ph-split__copy">
          <div className="ph-split__copy-inner">
            {eyebrow ? (
              <div className="ph-split__eyebrow-row">
                <span className="ph-split__eyebrow-line" aria-hidden />
                <p className="ph-split__eyebrow">{eyebrow}</p>
              </div>
            ) : null}

            {title ? (
              <TitleTag id={titleId} className="ph-split__title">
                <span className="ph-split__title-line">{title}</span>
                {titleLine2 ? (
                  <span className="ph-split__title-line ph-split__title-line--accent">
                    {titleLine2}
                    <span className="ph-split__brush-accent" aria-hidden />
                  </span>
                ) : null}
              </TitleTag>
            ) : null}

            {paragraphs.length > 0 ? (
              <div className="ph-split__body">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className="ph-split__body-p">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}

            {signatureText ? (
              <p className="ph-split__signature">{signatureText}</p>
            ) : null}
          </div>
        </div>

        <figure className="ph-split__media">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={imageAlt} className="ph-split__media-img" />
          ) : (
            <div className="ph-split__media-placeholder" aria-hidden />
          )}
        </figure>
      </div>
    </Wrapper>
  );
}
