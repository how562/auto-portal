import {
  formatVehicleLabel,
  formatVehiclePrice,
  getEffectiveVehiclePrice,
  vehicleDetailPath,
} from "@/lib/format";
import type { Vehicle } from "@/lib/types";
import { DATA_QUALITY_MAX_SCORE } from "@/lib/vehicleQuality";

interface AdminInventoryTableProps {
  vehicles: Vehicle[];
}

function imageCount(v: Vehicle): number {
  if (typeof v.image_count === "number") return v.image_count;
  if (Array.isArray(v.image_urls)) return v.image_urls.length;
  return v.primary_image_url ? 1 : 0;
}

function qualityScore(v: Vehicle): number {
  return typeof v.data_quality_score === "number" ? v.data_quality_score : 0;
}

function qualityTone(score: number): string {
  const ratio = score / DATA_QUALITY_MAX_SCORE;
  if (ratio >= 0.75) return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (ratio >= 0.5) return "bg-amber-50 text-amber-800 ring-amber-200";
  return "bg-rose-50 text-rose-800 ring-rose-200";
}

function formatTimestamp(value: string | null | undefined): string {
  if (!value) return "—";
  const t = Date.parse(value);
  if (!Number.isFinite(t)) return "—";
  return new Date(t).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AdminInventoryTable({ vehicles }: AdminInventoryTableProps) {
  if (vehicles.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--line-dark)] px-6 py-12 text-center text-sm text-[var(--muted)]">
        No active vehicles in this view.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="bg-[var(--cream)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Vehicle</th>
            <th scope="col" className="px-4 py-3 font-semibold">Stock #</th>
            <th scope="col" className="px-4 py-3 font-semibold">Price</th>
            <th scope="col" className="px-4 py-3 font-semibold">Photos</th>
            <th scope="col" className="px-4 py-3 font-semibold">Quality</th>
            <th scope="col" className="px-4 py-3 font-semibold">Imported</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {vehicles.map((vehicle) => {
            const photos = imageCount(vehicle);
            const score = qualityScore(vehicle);
            const hasPhotos = photos > 0;
            return (
              <tr key={vehicle.id} className="align-top">
                <td className="px-4 py-3">
                  <a
                    href={vehicleDetailPath(vehicle.id)}
                    className="font-medium text-[var(--ink)] hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {formatVehicleLabel(vehicle)}
                  </a>
                  <p className="text-xs text-[var(--muted)]">
                    {[vehicle.condition, vehicle.body_style]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {vehicle.stock_number ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium">{formatVehiclePrice(vehicle)}</span>
                  {getEffectiveVehiclePrice(vehicle).source === "msrp" ? (
                    <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      MSRP
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ${
                      hasPhotos
                        ? "bg-white text-[var(--ink)] ring-[var(--line-dark)]"
                        : "bg-rose-50 text-rose-800 ring-rose-200"
                    }`}
                  >
                    {hasPhotos ? `${photos} photo${photos === 1 ? "" : "s"}` : "No photos"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ${qualityTone(score)}`}
                    title={`Score ${score} of ${DATA_QUALITY_MAX_SCORE}`}
                  >
                    {score}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {formatTimestamp(vehicle.imported_at ?? vehicle.created_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
