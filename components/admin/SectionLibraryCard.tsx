import { SectionWireframe } from "@/components/admin/SectionWireframe";
import type { CMSSectionLibraryEntry } from "@/lib/cmsSectionLibrary";

interface SectionLibraryCardProps {
  entry: CMSSectionLibraryEntry;
  compact?: boolean;
}

export function SectionLibraryCard({ entry, compact = false }: SectionLibraryCardProps) {
  return (
    <article
      className={`flex flex-col rounded-xl border border-[var(--line-dark)] bg-white ${
        compact ? "" : "overflow-hidden"
      }`}
    >
      <SectionWireframe
        type={entry.type}
        className={compact ? "rounded-b-none border-0" : "rounded-b-none border-x-0 border-t-0"}
      />
      <div className={compact ? "p-4" : "space-y-3 p-5"}>
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-[var(--ink)]">
            {entry.label}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{entry.description}</p>
        </div>
        {!compact ? (
          <>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Best for
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--ink)]/80">
                {entry.bestUseCase}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Supported fields
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {entry.supportedFieldsList.map((field) => (
                  <li
                    key={field}
                    className="rounded-md bg-[var(--cream-dark)] px-2 py-0.5 font-mono text-[10px] text-[var(--ink)]"
                  >
                    {field}
                  </li>
                ))}
              </ul>
            </div>
            {entry.recommendedImageSize ? (
              <p className="text-xs text-[var(--muted)]">
                <span className="font-semibold text-[var(--ink)]">Image size:</span>{" "}
                {entry.recommendedImageSize}
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </article>
  );
}
