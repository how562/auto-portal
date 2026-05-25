import Link from "next/link";
import { CmsDebugSectionPreview } from "@/components/admin/CmsDebugSectionPreview";
import { CmsDebugSlugForm } from "@/components/admin/CmsDebugSlugForm";
import type {
  CmsDebugNormalizedRow,
  CmsDebugPayload,
  CmsDebugRawSectionRow,
} from "@/lib/cmsDebugFetch";
import type { EnrichedCMSSection } from "@/lib/cmsSectionModel";

function CellValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="text-red-600">null</span>;
  }
  if (typeof value === "boolean") {
    return <span className="font-mono">{value ? "true" : "false"}</span>;
  }
  if (typeof value === "object") {
    return (
      <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-snug">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  const text = String(value);
  if (text.includes("\n") || text.length > 120) {
    return (
      <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-snug">
        {text}
      </pre>
    );
  }
  return <span className="font-mono break-all">{text}</span>;
}

function FieldTable({
  title,
  rows,
}: {
  title: string;
  rows: { key: string; value: unknown }[];
}) {
  return (
    <div className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-white">
      <h3 className="border-b border-[var(--line)] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        {title}
      </h3>
      <table className="w-full text-left text-xs">
        <tbody>
          {rows.map(({ key, value }) => (
            <tr key={key} className="border-b border-[var(--line)] last:border-0">
              <th className="w-36 shrink-0 align-top px-3 py-2 font-medium text-[var(--muted)]">
                {key}
              </th>
              <td className="min-w-0 px-3 py-2 text-[var(--ink)]">
                <CellValue value={value} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function rawRows(raw: CmsDebugRawSectionRow): { key: string; value: unknown }[] {
  return [
    { key: "id", value: raw.id },
    { key: "section_type", value: raw.section_type },
    { key: "is_active", value: raw.is_active },
    { key: "sort_order", value: raw.sort_order },
    { key: "title", value: raw.title },
    { key: "headline", value: raw.headline },
    { key: "content", value: raw.content },
    { key: "body", value: raw.body },
    { key: "subtitle", value: raw.subtitle },
    { key: "subheadline", value: raw.subheadline },
    { key: "image_url", value: raw.image_url },
    { key: "settings", value: raw.settings },
  ];
}

function normalizedRows(
  normalized: CmsDebugNormalizedRow | null,
): { key: string; value: unknown }[] {
  if (!normalized) {
    return [{ key: "parse", value: "parsePageSectionFromDb returned null" }];
  }
  return [
    { key: "id", value: normalized.id },
    { key: "section_type", value: normalized.section_type },
    { key: "headline", value: normalized.headline },
    { key: "body", value: normalized.body },
    { key: "subheadline", value: normalized.subheadline },
    { key: "image_url", value: normalized.image_url },
    { key: "cta_text", value: normalized.cta_text },
    { key: "cta_url", value: normalized.cta_url },
    { key: "settings", value: normalized.settings },
    {
      key: "supported renderer",
      value: normalized.hasDedicatedRenderer ? "yes" : "no",
    },
  ];
}

interface CmsDebugScreenProps {
  data: CmsDebugPayload;
}

export function CmsDebugScreen({ data }: CmsDebugScreenProps) {
  const { slug, page, sections, error } = data;

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 sm:p-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
          Temporary diagnostic — CMS pipeline
        </p>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">CMS debug</h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Raw Supabase rows vs <code className="text-xs">parsePageSectionFromDb</code> vs{" "}
          <code className="text-xs">CMSSectionRenderer</code>. Public routes are unchanged.
        </p>
        {page?.status === "published" ? (
          <p className="text-sm">
            <Link
              href={`/${page.slug}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--ink)] underline"
            >
              Open public /{page.slug}
            </Link>
          </p>
        ) : null}
      </header>

      <CmsDebugSlugForm slug={slug} />

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--ink)]">1. site_pages</h2>
        {!page ? (
          <p className="text-sm text-[var(--muted)]">
            No row for slug <code className="font-mono">{slug}</code>.
          </p>
        ) : (
          <FieldTable
            title="site_pages (Supabase)"
            rows={[
              { key: "id", value: page.id },
              { key: "slug", value: page.slug },
              { key: "title", value: page.title },
              { key: "status", value: page.status },
            ]}
          />
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-[var(--ink)]">
          2–4. page_sections ({sections.length} rows, all is_active values)
        </h2>
        {sections.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No sections for this page.</p>
        ) : (
          <div className="space-y-10">
            {sections.map((bundle, index) => {
              const label = `${bundle.raw.sort_order} · ${bundle.raw.section_type} · ${bundle.raw.id.slice(0, 8)}`;
              const previewSection: EnrichedCMSSection | null = bundle.section;

              return (
                <article
                  key={bundle.raw.id}
                  className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--cream-dark)]/40 p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--ink)]">
                      Section {index + 1}
                    </span>
                    <code className="rounded bg-white px-2 py-0.5 text-xs">{label}</code>
                    {!bundle.raw.is_active ? (
                      <span className="text-xs font-medium text-amber-800">inactive</span>
                    ) : null}
                    {bundle.normalized == null ? (
                      <span className="text-xs font-medium text-red-700">
                        normalization failed
                      </span>
                    ) : null}
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <FieldTable title="2. Raw (Supabase)" rows={rawRows(bundle.raw)} />
                    <FieldTable
                      title="3. Normalized (parsePageSectionFromDb)"
                      rows={normalizedRows(bundle.normalized)}
                    />
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      4. Render preview (CMSSectionRenderer)
                    </h3>
                    {previewSection ? (
                      <CmsDebugSectionPreview section={previewSection} label={label} />
                    ) : (
                      <p className="text-sm text-red-700">
                        Skipped — section did not parse; renderer not invoked.
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
