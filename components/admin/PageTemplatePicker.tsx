"use client";

import { SectionWireframe } from "@/components/admin/SectionWireframe";
import { listPageTemplates, type PageTemplateId } from "@/lib/cmsPageTemplates";

interface PageTemplatePickerProps {
  selectedId: PageTemplateId | "";
  onSelect: (id: PageTemplateId) => void;
}

export function PageTemplatePicker({
  selectedId,
  onSelect,
}: PageTemplatePickerProps) {
  const templates = listPageTemplates();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => {
        const selected = selectedId === template.id;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            className={`rounded-xl border bg-white p-4 text-left transition ${
              selected
                ? "border-[var(--ink)] ring-2 ring-[var(--ink)]/12"
                : "border-[var(--line-dark)] hover:border-[var(--ink)]/30"
            }`}
          >
            <div className="flex gap-1 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--cream)] p-2">
              {template.sectionTypes.slice(0, 4).map((type) => (
                <div key={type} className="min-w-0 flex-1">
                  <SectionWireframe type={type} className="aspect-square border-0" />
                </div>
              ))}
            </div>
            <h3 className="mt-3 font-semibold text-[var(--ink)]">{template.label}</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">{template.description}</p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--ink)]/75">
              {template.bestFor}
            </p>
            <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-[var(--muted)]">
              {template.sections.length} sections
            </p>
          </button>
        );
      })}
    </div>
  );
}
