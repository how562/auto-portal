"use client";

import type { CavenderCommitmentPageContent } from "@/lib/cavenderCommitmentPageContent";
import {
  FormSection,
  TextAreaField,
  TextField,
} from "@/components/admin/dedicated-page/formFields";

export function CavenderCommitmentContentForm({
  content,
  onChange,
}: {
  content: CavenderCommitmentPageContent;
  onChange: (content: CavenderCommitmentPageContent) => void;
}) {
  function patch<K extends keyof CavenderCommitmentPageContent>(
    key: K,
    value: CavenderCommitmentPageContent[K],
  ) {
    onChange({ ...content, [key]: value });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--muted)]">
        Editorial layout (like About Us) with hero, program explanation, veterans video, and
        disclaimer at{" "}
        <code className="rounded bg-[var(--cream)] px-1 text-xs">/cavender-commitment</code>.
      </p>

      <FormSection title="Hero">
        <TextField
          label="Hero image URL"
          value={content.hero.imageUrl}
          onChange={(imageUrl) => patch("hero", { ...content.hero, imageUrl })}
          className="sm:col-span-2"
          mono
        />
        <TextField
          label="Title line 1"
          value={content.hero.headlineLine1}
          onChange={(headlineLine1) => patch("hero", { ...content.hero, headlineLine1 })}
        />
        <TextField
          label="Title line 2 (gold)"
          value={content.hero.headlineLine2}
          onChange={(headlineLine2) => patch("hero", { ...content.hero, headlineLine2 })}
        />
        <TextField
          label="Tagline"
          value={content.hero.headlineAccent}
          onChange={(headlineAccent) => patch("hero", { ...content.hero, headlineAccent })}
          className="sm:col-span-2"
        />
        <TextField
          label="Classification badge"
          value={content.memo.classification}
          onChange={(classification) => patch("memo", { ...content.memo, classification })}
          className="sm:col-span-2"
        />
        <TextField
          label="Primary CTA label"
          value={content.hero.primaryCta.label}
          onChange={(label) =>
            patch("hero", { ...content.hero, primaryCta: { ...content.hero.primaryCta, label } })
          }
        />
        <TextField
          label="Primary CTA URL"
          value={content.hero.primaryCta.href}
          onChange={(href) =>
            patch("hero", { ...content.hero, primaryCta: { ...content.hero.primaryCta, href } })
          }
          mono
        />
        <TextField
          label="Secondary CTA label"
          value={content.hero.secondaryCta.label}
          onChange={(label) =>
            patch("hero", {
              ...content.hero,
              secondaryCta: { ...content.hero.secondaryCta, label },
            })
          }
        />
        <TextField
          label="Secondary CTA URL"
          value={content.hero.secondaryCta.href}
          onChange={(href) =>
            patch("hero", {
              ...content.hero,
              secondaryCta: { ...content.hero.secondaryCta, href },
            })
          }
          mono
        />
      </FormSection>

      <FormSection title="Program explanation">
        <TextField
          label="Eyebrow"
          value={content.explanation.eyebrow}
          onChange={(eyebrow) => patch("explanation", { ...content.explanation, eyebrow })}
        />
        <TextField
          label="Headline"
          value={content.explanation.headline}
          onChange={(headline) => patch("explanation", { ...content.explanation, headline })}
        />
        <TextField
          label="Headline accent (underlined)"
          value={content.explanation.headlineAccent}
          onChange={(headlineAccent) =>
            patch("explanation", { ...content.explanation, headlineAccent })
          }
        />
        <TextField
          label="Side image URL"
          value={content.explanation.imageUrl}
          onChange={(imageUrl) => patch("explanation", { ...content.explanation, imageUrl })}
          className="sm:col-span-2"
          mono
        />
        <TextAreaField
          label="Body"
          value={content.intro.body}
          onChange={(body) => patch("intro", { ...content.intro, body })}
          className="sm:col-span-2"
        />
      </FormSection>

      <FormSection title="Veterans video">
        <TextField
          label="Eyebrow"
          value={content.veteransVideo.eyebrow}
          onChange={(eyebrow) =>
            patch("veteransVideo", { ...content.veteransVideo, eyebrow })
          }
        />
        <TextField
          label="Headline"
          value={content.veteransVideo.headline}
          onChange={(headline) =>
            patch("veteransVideo", { ...content.veteransVideo, headline })
          }
          className="sm:col-span-2"
        />
        <TextAreaField
          label="Body"
          value={content.veteransVideo.body}
          onChange={(body) => patch("veteransVideo", { ...content.veteransVideo, body })}
          className="sm:col-span-2"
        />
        <TextField
          label="Video URL (MP4 or YouTube/Vimeo)"
          value={content.veteransVideo.videoUrl}
          onChange={(videoUrl) =>
            patch("veteransVideo", { ...content.veteransVideo, videoUrl })
          }
          className="sm:col-span-2"
          mono
        />
        <TextField
          label="Poster image URL"
          value={content.veteransVideo.posterUrl}
          onChange={(posterUrl) =>
            patch("veteransVideo", { ...content.veteransVideo, posterUrl })
          }
          className="sm:col-span-2"
          mono
        />
      </FormSection>

      <FormSection title="Disclaimer">
        <TextField
          label="Headline"
          value={content.disclaimer.headline}
          onChange={(headline) => patch("disclaimer", { ...content.disclaimer, headline })}
          className="sm:col-span-2"
        />
        {content.disclaimer.paragraphs.map((paragraph, index) => (
          <TextAreaField
            key={`disclaimer-${index}`}
            label={`Paragraph ${index + 1}`}
            value={paragraph}
            onChange={(value) => {
              const paragraphs = content.disclaimer.paragraphs.map((row, i) =>
                i === index ? value : row,
              );
              patch("disclaimer", { ...content.disclaimer, paragraphs });
            }}
            className="sm:col-span-2"
          />
        ))}
      </FormSection>
    </div>
  );
}
