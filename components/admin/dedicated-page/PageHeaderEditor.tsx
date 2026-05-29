"use client";

import { CmsImageField } from "@/components/admin/CmsImageField";
import {
  FormSection,
  linesFromTextarea,
  TextAreaField,
  TextField,
  textareaFromLines,
} from "@/components/admin/dedicated-page/formFields";
import {
  PAGE_HEADER_IMAGE_HINTS,
  PAGE_HEADER_TYPES,
  RECOMMENDED_PAGE_HEADER_TYPE,
  type PageHeaderConfig,
  type PageHeaderSlug,
  type PageHeaderType,
} from "@/lib/pageHeaderTypes";
import { switchHeaderType } from "@/lib/pageHeaderResolve";

interface PageHeaderEditorProps {
  slug: PageHeaderSlug;
  header: PageHeaderConfig | undefined;
  legacyContent: unknown;
  onChange: (header: PageHeaderConfig) => void;
}

const TYPE_LABELS: Record<PageHeaderType, string> = {
  none: "None (hidden)",
  cinematic: "Cinematic",
  editorial: "Editorial (dark spread)",
  split: "Half & half (50/50)",
  utility: "Utility",
  magazine: "Magazine",
};

export function PageHeaderEditor({
  slug,
  header,
  legacyContent,
  onChange,
}: PageHeaderEditorProps) {
  const currentType = header?.type ?? RECOMMENDED_PAGE_HEADER_TYPE[slug] ?? "editorial";
  const recommended = RECOMMENDED_PAGE_HEADER_TYPE[slug];

  function setType(nextType: PageHeaderType) {
    onChange(switchHeaderType(header, nextType, slug, legacyContent));
  }

  function patchHeader(next: PageHeaderConfig) {
    onChange(next);
  }

  return (
    <FormSection title="Page header">
      <p className="sm:col-span-2 text-sm text-[var(--muted)]">
        Recommended for this page:{" "}
        <strong className="text-[var(--ink)]">{TYPE_LABELS[recommended]}</strong>
      </p>
      <label className="block space-y-1 sm:col-span-2">
        <span className="text-xs font-medium text-[var(--muted)]">Header type</span>
        <select
          value={currentType}
          onChange={(e) => setType(e.target.value as PageHeaderType)}
          className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
        >
          {PAGE_HEADER_TYPES.map((type) => (
            <option key={type} value={type}>
              {TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>

      {currentType === "none" ? (
        <p className="sm:col-span-2 text-sm text-[var(--muted)]">
          No shared header will render. Legacy hero sections on the page may still appear
          until removed from the page template.
        </p>
      ) : null}

      {currentType === "cinematic" && header?.type === "cinematic" ? (
        <CinematicFields
          data={header.cinematic}
          onChange={(cinematic) => patchHeader({ type: "cinematic", cinematic })}
        />
      ) : null}

      {currentType === "editorial" && header?.type === "editorial" ? (
        <EditorialFields
          data={header.editorial}
          onChange={(editorial) => patchHeader({ type: "editorial", editorial })}
        />
      ) : null}

      {currentType === "split" && header?.type === "split" ? (
        <SplitFields
          data={header.split}
          onChange={(split) => patchHeader({ type: "split", split })}
        />
      ) : null}

      {currentType === "utility" && header?.type === "utility" ? (
        <UtilityFields
          data={header.utility}
          onChange={(utility) => patchHeader({ type: "utility", utility })}
        />
      ) : null}

      {currentType === "magazine" && header?.type === "magazine" ? (
        <MagazineFields
          data={header.magazine}
          onChange={(magazine) => patchHeader({ type: "magazine", magazine })}
        />
      ) : null}

      {currentType !== "none" && header?.type !== currentType ? (
        <p className="sm:col-span-2 text-sm text-amber-800">
          Select a header type above to load fields.
        </p>
      ) : null}
    </FormSection>
  );
}

function CinematicFields({
  data,
  onChange,
}: {
  data: import("@/lib/pageHeaderTypes").CinematicPageHeaderFields;
  onChange: (data: import("@/lib/pageHeaderTypes").CinematicPageHeaderFields) => void;
}) {
  const patch = (p: Partial<typeof data>) => onChange({ ...data, ...p });

  return (
    <>
      <TextField label="Eyebrow" value={data.eyebrow} onChange={(eyebrow) => patch({ eyebrow })} />
      <TextField label="Title" value={data.title} onChange={(title) => patch({ title })} className="sm:col-span-2" />
      <TextAreaField
        label="Subtitle"
        value={data.subtitle}
        onChange={(subtitle) => patch({ subtitle })}
        className="sm:col-span-2"
        rows={2}
      />
      <div className="sm:col-span-2">
        <CmsImageField
          label="Background image (desktop)"
          value={data.backgroundImage}
          onChange={(backgroundImage) => patch({ backgroundImage })}
          hint={PAGE_HEADER_IMAGE_HINTS.cinematicDesktop}
        />
      </div>
      <div className="sm:col-span-2">
        <CmsImageField
          label="Background image (mobile)"
          value={data.mobileBackgroundImage}
          onChange={(mobileBackgroundImage) => patch({ mobileBackgroundImage })}
          hint={PAGE_HEADER_IMAGE_HINTS.cinematicMobile}
        />
      </div>
      <label className="block space-y-1 sm:col-span-2">
        <span className="text-xs font-medium text-[var(--muted)]">
          Overlay opacity ({data.overlayOpacity}%)
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={data.overlayOpacity}
          onChange={(e) => patch({ overlayOpacity: Number(e.target.value) })}
          className="w-full"
        />
      </label>
      <div className="sm:col-span-2">
        <CmsImageField
          label="Logo image (optional)"
          value={data.logoImageUrl}
          onChange={(logoImageUrl) => patch({ logoImageUrl })}
        />
      </div>
      <TextField label="Logo alt text" value={data.logoAlt} onChange={(logoAlt) => patch({ logoAlt })} />
      <TextField
        label="Primary button label"
        value={data.primaryButtonLabel}
        onChange={(primaryButtonLabel) => patch({ primaryButtonLabel })}
      />
      <TextField
        label="Primary button URL"
        value={data.primaryButtonUrl}
        onChange={(primaryButtonUrl) => patch({ primaryButtonUrl })}
        mono
      />
      <TextField
        label="Secondary button label"
        value={data.secondaryButtonLabel}
        onChange={(secondaryButtonLabel) => patch({ secondaryButtonLabel })}
      />
      <TextField
        label="Secondary button URL"
        value={data.secondaryButtonUrl}
        onChange={(secondaryButtonUrl) => patch({ secondaryButtonUrl })}
        mono
      />
    </>
  );
}

function EditorialFields({
  data,
  onChange,
}: {
  data: import("@/lib/pageHeaderTypes").EditorialPageHeaderFields;
  onChange: (data: import("@/lib/pageHeaderTypes").EditorialPageHeaderFields) => void;
}) {
  const patch = (p: Partial<typeof data>) => onChange({ ...data, ...p });

  return (
    <>
      <TextField label="Eyebrow" value={data.eyebrow} onChange={(eyebrow) => patch({ eyebrow })} />
      <TextField label="Title" value={data.title} onChange={(title) => patch({ title })} />
      <TextAreaField
        label="Supporting statement (right column)"
        value={data.introText}
        onChange={(introText) => patch({ introText })}
        className="sm:col-span-2"
        rows={4}
        hint="Magazine spread layout — no header photography."
      />
      <TextField
        label="Attribution / signature (optional)"
        value={data.signatureText}
        onChange={(signatureText) => patch({ signatureText })}
        className="sm:col-span-2"
      />
      <TextAreaField
        label="Category labels (one per line, optional)"
        value={textareaFromLines(data.categoryLabels ?? [])}
        onChange={(text) => patch({ categoryLabels: linesFromTextarea(text) })}
        className="sm:col-span-2"
        rows={2}
      />
      <TextField
        label="Primary button label"
        value={data.primaryButtonLabel}
        onChange={(primaryButtonLabel) => patch({ primaryButtonLabel })}
      />
      <TextField
        label="Primary button URL"
        value={data.primaryButtonUrl}
        onChange={(primaryButtonUrl) => patch({ primaryButtonUrl })}
        mono
      />
    </>
  );
}

function SplitFields({
  data,
  onChange,
}: {
  data: import("@/lib/pageHeaderTypes").SplitFeaturePageHeaderFields;
  onChange: (data: import("@/lib/pageHeaderTypes").SplitFeaturePageHeaderFields) => void;
}) {
  const patch = (p: Partial<typeof data>) => onChange({ ...data, ...p });

  return (
    <>
      <TextField label="Eyebrow" value={data.eyebrow} onChange={(eyebrow) => patch({ eyebrow })} />
      <TextField label="Title (line 1)" value={data.title} onChange={(title) => patch({ title })} />
      <TextField
        label="Title (line 2 — gold brush accent)"
        value={data.titleLine2}
        onChange={(titleLine2) => patch({ titleLine2 })}
      />
      <TextAreaField
        label="Body copy (left column)"
        value={data.introText}
        onChange={(introText) => patch({ introText })}
        className="sm:col-span-2"
        rows={8}
        hint="Separate paragraphs with a blank line."
      />
      <TextField
        label="Handwritten signature"
        value={data.signatureText}
        onChange={(signatureText) => patch({ signatureText })}
        className="sm:col-span-2"
      />
      <div className="sm:col-span-2">
        <CmsImageField
          label="Image (right column)"
          value={data.image}
          onChange={(image) => patch({ image })}
          hint={PAGE_HEADER_IMAGE_HINTS.splitFeature}
        />
      </div>
      <TextField label="Image alt" value={data.imageAlt} onChange={(imageAlt) => patch({ imageAlt })} />
    </>
  );
}

function UtilityFields({
  data,
  onChange,
}: {
  data: import("@/lib/pageHeaderTypes").UtilityPageHeaderFields;
  onChange: (data: import("@/lib/pageHeaderTypes").UtilityPageHeaderFields) => void;
}) {
  const patch = (p: Partial<typeof data>) => onChange({ ...data, ...p });

  return (
    <>
      <TextField label="Eyebrow" value={data.eyebrow} onChange={(eyebrow) => patch({ eyebrow })} />
      <TextField label="Title" value={data.title} onChange={(title) => patch({ title })} />
      <TextAreaField
        label="Intro text"
        value={data.introText}
        onChange={(introText) => patch({ introText })}
        className="sm:col-span-2"
        rows={3}
      />
      <TextAreaField
        label="Support points (one per line)"
        value={textareaFromLines(data.supportPoints)}
        onChange={(text) => patch({ supportPoints: linesFromTextarea(text) })}
        className="sm:col-span-2"
        rows={3}
      />
      <TextField
        label="Form slot id (optional, e.g. trade-iframe)"
        value={data.formSlot}
        onChange={(formSlot) => patch({ formSlot })}
      />
      <TextField
        label="Tool slot id (optional)"
        value={data.toolSlot}
        onChange={(toolSlot) => patch({ toolSlot })}
      />
      <div className="sm:col-span-2">
        <CmsImageField
          label="Vehicle / tool image"
          value={data.vehicleImage}
          onChange={(vehicleImage) => patch({ vehicleImage })}
          hint={PAGE_HEADER_IMAGE_HINTS.utilityVehicle}
        />
      </div>
      <TextField
        label="Vehicle image alt"
        value={data.vehicleImageAlt}
        onChange={(vehicleImageAlt) => patch({ vehicleImageAlt })}
      />
      <TextField
        label="Primary button label"
        value={data.primaryButtonLabel}
        onChange={(primaryButtonLabel) => patch({ primaryButtonLabel })}
      />
      <TextField
        label="Primary button URL"
        value={data.primaryButtonUrl}
        onChange={(primaryButtonUrl) => patch({ primaryButtonUrl })}
        mono
      />
      <TextField
        label="Secondary button label"
        value={data.secondaryButtonLabel}
        onChange={(secondaryButtonLabel) => patch({ secondaryButtonLabel })}
      />
      <TextField
        label="Secondary button URL"
        value={data.secondaryButtonUrl}
        onChange={(secondaryButtonUrl) => patch({ secondaryButtonUrl })}
        mono
      />
    </>
  );
}

function MagazineFields({
  data,
  onChange,
}: {
  data: import("@/lib/pageHeaderTypes").MagazinePageHeaderFields;
  onChange: (data: import("@/lib/pageHeaderTypes").MagazinePageHeaderFields) => void;
}) {
  const patch = (p: Partial<typeof data>) => onChange({ ...data, ...p });
  const linksText = data.categoryLinks
    .map((l) => `${l.label}|${l.href}`)
    .join("\n");

  return (
    <>
      <div className="sm:col-span-2">
        <CmsImageField
          label="Logo image (optional)"
          value={data.logoUrl}
          onChange={(logoUrl) => patch({ logoUrl })}
          hint={PAGE_HEADER_IMAGE_HINTS.magazineLogo}
        />
      </div>
      <TextField
        label="Logo text (if no image)"
        value={data.logoText}
        onChange={(logoText) => patch({ logoText })}
      />
      <TextField label="Eyebrow" value={data.eyebrow} onChange={(eyebrow) => patch({ eyebrow })} />
      <TextField label="Title" value={data.title} onChange={(title) => patch({ title })} />
      <TextAreaField
        label="Subtitle"
        value={data.subtitle}
        onChange={(subtitle) => patch({ subtitle })}
        className="sm:col-span-2"
        rows={2}
      />
      <TextAreaField
        label="Category links (label|url per line)"
        value={linksText}
        onChange={(text) => {
          const categoryLinks = linesFromTextarea(text)
            .map((line) => {
              const [label, href] = line.split("|").map((s) => s.trim());
              if (!label || !href) return null;
              return { label, href };
            })
            .filter((l): l is { label: string; href: string } => l !== null);
          patch({ categoryLinks });
        }}
        className="sm:col-span-2"
        rows={4}
      />
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input
          type="checkbox"
          checked={data.darkMode}
          onChange={(e) => patch({ darkMode: e.target.checked })}
        />
        Dark mode (editorial / stories style)
      </label>
    </>
  );
}
