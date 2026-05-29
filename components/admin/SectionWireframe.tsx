import type { CMSSectionType } from "@/lib/cmsTypes";

const block = "rounded-sm bg-[var(--line)]";
const blockDark = "rounded-sm bg-[var(--ink)]/12";
const blockGold = "rounded-sm bg-[var(--gold)]/35";

interface SectionWireframeProps {
  type: CMSSectionType;
  className?: string;
}

export function SectionWireframe({ type, className = "" }: SectionWireframeProps) {
  return (
    <div
      className={`aspect-[16/10] overflow-hidden rounded-lg border border-[var(--line-dark)] bg-[var(--cream)] p-3 ${className}`.trim()}
      aria-hidden
    >
      {type === "hero" && (
        <div className="flex h-full flex-col justify-center rounded-md border border-dashed border-[var(--line-dark)] bg-white/80 p-3">
          <div className={`h-1.5 w-12 ${blockGold}`} />
          <div className={`mt-2 h-3 w-4/5 ${blockDark}`} />
          <div className={`mt-1.5 h-2 w-3/5 ${block}`} />
          <div className={`mt-3 h-5 w-20 rounded-md ${blockDark}`} />
        </div>
      )}
      {type === "text_block" && (
        <div className="flex h-full flex-col justify-center gap-2 px-2">
          <div className={`h-2.5 w-2/3 mx-auto ${blockDark}`} />
          <div className={`h-1.5 w-full ${block}`} />
          <div className={`h-1.5 w-full ${block}`} />
          <div className={`h-1.5 w-4/5 ${block}`} />
        </div>
      )}
      {type === "image_text" && (
        <div className="grid h-full grid-cols-2 gap-2">
          <div className="flex flex-col justify-center gap-1.5">
            <div className={`h-2 w-4/5 ${blockDark}`} />
            <div className={`h-1 w-full ${block}`} />
            <div className={`h-1 w-full ${block}`} />
          </div>
          <div className={`${block} min-h-0`} />
        </div>
      )}
      {type === "half_half" && (
        <div className="grid h-full grid-cols-2 gap-0">
          <div className="flex flex-col justify-center gap-1.5 bg-[#faf8f5] p-2">
            <div className={`h-0.5 w-6 ${blockGold}`} />
            <div className={`h-2 w-4/5 ${blockDark}`} />
            <div className={`h-1.5 w-3/5 ${blockDark}`} />
            <div className={`h-1 w-full ${block}`} />
            <div className={`mt-1 h-1 w-2/5 ${blockGold}`} />
          </div>
          <div className={`${block} min-h-0`} />
        </div>
      )}
      {type === "split_feature" && (
        <div className="grid h-full grid-cols-[1fr_1.1fr] gap-2">
          <div className="flex flex-col gap-1.5">
            <div className={`flex-1 rounded-md border border-[var(--line)] bg-white p-1.5`}>
              <div className={`h-1.5 w-3/4 ${blockDark}`} />
              <div className={`mt-1 h-1 w-full ${block}`} />
            </div>
            <div className={`flex-1 rounded-md border border-[var(--line)] bg-white p-1.5`}>
              <div className={`h-1.5 w-3/4 ${blockDark}`} />
              <div className={`mt-1 h-1 w-full ${block}`} />
            </div>
          </div>
          <div className={`${block} min-h-0`} />
        </div>
      )}
      {type === "cta_band" && (
        <div className="flex h-full flex-col items-center justify-center gap-2 rounded-md bg-[var(--charcoal)]/90 px-3">
          <div className="h-2 w-3/5 rounded-sm bg-white/30" />
          <div className="h-1.5 w-2/5 rounded-sm bg-white/20" />
          <div className="mt-1 flex gap-1.5">
            <div className="h-4 w-10 rounded-sm bg-white/40" />
            <div className="h-4 w-10 rounded-sm border border-white/25" />
          </div>
        </div>
      )}
      {type === "card_grid" && (
        <div className="grid h-full grid-cols-3 gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-sm border border-[var(--line)] bg-white"
            >
              <div className={`aspect-[16/10] ${block}`} />
              <div className="space-y-1 p-1.5">
                <div className={`h-1.5 w-3/4 ${blockDark}`} />
                <div className={`h-1 w-full ${block}`} />
              </div>
            </div>
          ))}
        </div>
      )}
      {type === "faq" && (
        <div className="flex h-full flex-col justify-center gap-1.5">
          <div className={`mx-auto h-2 w-1/2 ${blockDark}`} />
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-sm border border-[var(--line)] bg-white px-2 py-1.5"
            >
              <div className={`h-1.5 w-4/5 ${blockDark}`} />
              <div className={`mt-1 h-1 w-full ${block}`} />
            </div>
          ))}
        </div>
      )}
      {type === "stats" && (
        <div className="grid h-full grid-cols-4 items-center gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className={`mx-auto h-3 w-6 ${blockDark}`} />
              <div className={`mx-auto mt-1 h-1 w-8 ${block}`} />
            </div>
          ))}
        </div>
      )}
      {type === "locations" && (
        <div className="flex h-full flex-col justify-center gap-2">
          <div className={`mx-auto h-1.5 w-1/3 ${blockGold}`} />
          <div className="grid grid-cols-3 gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-sm border border-[var(--line)] bg-[var(--cream-dark)]/60 p-1.5"
              >
                <div className={`h-1.5 w-3/4 ${blockDark}`} />
                <div className={`mt-1 h-1 w-full ${block}`} />
              </div>
            ))}
          </div>
        </div>
      )}
      {type === "inventory_collection" && (
        <div className="flex h-full flex-col justify-center gap-2">
          <div className={`h-2 w-1/2 ${blockDark}`} />
          <div className="flex gap-1.5 overflow-hidden">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1/3 shrink-0 overflow-hidden rounded-sm border border-[var(--line)] bg-white"
              >
                <div className={`aspect-[4/3] ${block}`} />
                <div className="space-y-1 p-1">
                  <div className={`h-1 w-3/4 ${blockDark}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {type === "form" && (
        <div className="grid h-full grid-cols-2 gap-2">
          <div className="flex flex-col justify-center gap-1.5 rounded-md border border-[var(--line)] bg-white p-2">
            <div className={`h-2 w-3/4 ${blockDark}`} />
            <div className={`h-1 w-full ${block}`} />
            <div className={`mt-2 h-4 w-16 rounded-sm ${blockDark}`} />
          </div>
          <div className="space-y-1 rounded-md border border-dashed border-[var(--line-dark)] p-2">
            <div className={`h-2 w-full ${block}`} />
            <div className={`h-2 w-full ${block}`} />
            <div className={`h-2 w-2/3 ${block}`} />
          </div>
        </div>
      )}
      {type === "custom_html" && (
        <div className="flex h-full flex-col justify-center gap-2 rounded-md border border-dashed border-[var(--line-dark)] bg-white px-3">
          <div className={`h-2 w-1/2 ${blockDark}`} />
          <div className={`h-1.5 w-full ${block}`} />
          <div className={`h-1.5 w-5/6 font-mono text-[8px] text-[var(--muted)]`}>
            &lt;p&gt; … &lt;/p&gt;
          </div>
        </div>
      )}
    </div>
  );
}
