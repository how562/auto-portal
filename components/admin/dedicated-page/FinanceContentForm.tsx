"use client";

import type { FinancePageContent } from "@/lib/financePageContent";
import {
  FormSection,
  TextAreaField,
  TextField,
} from "@/components/admin/dedicated-page/formFields";

export function FinanceContentForm({
  content,
  onChange,
}: {
  content: FinancePageContent;
  onChange: (content: FinancePageContent) => void;
}) {
  function patch<K extends keyof FinancePageContent>(
    key: K,
    value: FinancePageContent[K],
  ) {
    onChange({ ...content, [key]: value });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--muted)]">
        Edit hero, intro, dealership finance links, feature band, and footer CTAs. External
        application URLs open in a new tab on the live page.
      </p>

      <FormSection title="Hero">
        <TextField
          label="Title"
          value={content.hero.title}
          onChange={(title) => patch("hero", { ...content.hero, title })}
        />
        <TextField
          label="Subtitle"
          value={content.hero.subtitle}
          onChange={(subtitle) => patch("hero", { ...content.hero, subtitle })}
          className="sm:col-span-2"
        />
        <TextAreaField
          label="Supporting line"
          value={content.hero.supportingLine}
          onChange={(supportingLine) =>
            patch("hero", { ...content.hero, supportingLine })
          }
          className="sm:col-span-2"
          rows={2}
        />
        <TextField
          label="Hero image URL"
          value={content.hero.imageUrl}
          onChange={(imageUrl) => patch("hero", { ...content.hero, imageUrl })}
          className="sm:col-span-2"
          mono
        />
      </FormSection>

      <FormSection title="Intro">
        <TextField
          label="Eyebrow"
          value={content.intro.eyebrow}
          onChange={(eyebrow) => patch("intro", { ...content.intro, eyebrow })}
        />
        <TextField
          label="Heading"
          value={content.intro.heading}
          onChange={(heading) => patch("intro", { ...content.intro, heading })}
        />
        <TextAreaField
          label="Body"
          value={content.intro.body}
          onChange={(body) => patch("intro", { ...content.intro, body })}
          className="sm:col-span-2"
          rows={4}
        />
      </FormSection>

      <FormSection title="Dealership cards">
        {content.dealers.map((dealer, index) => (
          <div
            key={dealer.id}
            className="sm:col-span-2 rounded-xl border border-[var(--line)] p-4"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Dealer {index + 1} · {dealer.id}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Name"
                value={dealer.name}
                onChange={(name) => {
                  const dealers = [...content.dealers];
                  dealers[index] = { ...dealer, name };
                  patch("dealers", dealers);
                }}
              />
              <TextField
                label="City / region"
                value={dealer.cityRegion}
                onChange={(cityRegion) => {
                  const dealers = [...content.dealers];
                  dealers[index] = { ...dealer, cityRegion };
                  patch("dealers", dealers);
                }}
              />
              <TextField
                label="Image URL"
                value={dealer.imageUrl}
                onChange={(imageUrl) => {
                  const dealers = [...content.dealers];
                  dealers[index] = { ...dealer, imageUrl };
                  patch("dealers", dealers);
                }}
                className="sm:col-span-2"
                mono
              />
              <TextField
                label="Apply URL"
                value={dealer.applyUrl}
                onChange={(applyUrl) => {
                  const dealers = [...content.dealers];
                  dealers[index] = { ...dealer, applyUrl };
                  patch("dealers", dealers);
                }}
                className="sm:col-span-2"
                mono
              />
              <TextField
                label="Button label"
                value={dealer.buttonLabel}
                onChange={(buttonLabel) => {
                  const dealers = [...content.dealers];
                  dealers[index] = { ...dealer, buttonLabel };
                  patch("dealers", dealers);
                }}
              />
            </div>
          </div>
        ))}
      </FormSection>

      <FormSection title="Feature band">
        {content.features.map((feature, index) => (
          <div
            key={feature.id}
            className="sm:col-span-2 rounded-xl border border-[var(--line)] p-4"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Feature {index + 1}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Title"
                value={feature.title}
                onChange={(title) => {
                  const features = [...content.features];
                  features[index] = { ...feature, title };
                  patch("features", features);
                }}
              />
              <label className="block space-y-1">
                <span className="text-xs font-medium text-[var(--muted)]">Icon</span>
                <select
                  value={feature.icon}
                  onChange={(e) => {
                    const features = [...content.features];
                    features[index] = {
                      ...feature,
                      icon: e.target.value as typeof feature.icon,
                    };
                    patch("features", features);
                  }}
                  className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                >
                  <option value="application">application</option>
                  <option value="locations">locations</option>
                  <option value="flexible">flexible</option>
                  <option value="support">support</option>
                </select>
              </label>
              <TextAreaField
                label="Description"
                value={feature.description}
                onChange={(description) => {
                  const features = [...content.features];
                  features[index] = { ...feature, description };
                  patch("features", features);
                }}
                className="sm:col-span-2"
                rows={2}
              />
            </div>
          </div>
        ))}
      </FormSection>

      <FormSection title="CTA band">
        <TextField
          label="Heading"
          value={content.cta.heading}
          onChange={(heading) => patch("cta", { ...content.cta, heading })}
          className="sm:col-span-2"
        />
        <TextField
          label="Locations button label"
          value={content.cta.locationsLabel}
          onChange={(locationsLabel) =>
            patch("cta", { ...content.cta, locationsLabel })
          }
        />
        <TextField
          label="Locations href"
          value={content.cta.locationsHref}
          onChange={(locationsHref) => patch("cta", { ...content.cta, locationsHref })}
          mono
        />
        <TextField
          label="Shop button label"
          value={content.cta.shopLabel}
          onChange={(shopLabel) => patch("cta", { ...content.cta, shopLabel })}
        />
        <TextField
          label="Shop href"
          value={content.cta.shopHref}
          onChange={(shopHref) => patch("cta", { ...content.cta, shopHref })}
          mono
        />
      </FormSection>
    </div>
  );
}
