import { formatVehicleTitle } from "@/lib/format";
import type { Vehicle } from "@/lib/types";

export function VehicleImagePlaceholder({ large }: { large?: boolean }) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[var(--cream-dark)] via-white to-[var(--line)] ${
        large ? "min-h-[280px] sm:min-h-[420px]" : "min-h-[180px]"
      }`}
    >
      <div
        className={`rounded-3xl bg-gradient-to-r from-[var(--charcoal)]/10 to-[var(--charcoal)]/5 ${
          large ? "h-24 w-40" : "h-14 w-24"
        }`}
      />
      <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--muted)]">
        Visual coming soon
      </span>
    </div>
  );
}

export function VehicleImage({
  vehicle,
  large,
  className,
}: {
  vehicle: Vehicle;
  large?: boolean;
  className?: string;
}) {
  const title = formatVehicleTitle(vehicle);

  if (vehicle.primary_image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={vehicle.primary_image_url}
        alt={title}
        className={className ?? "h-full w-full object-cover"}
      />
    );
  }

  return <VehicleImagePlaceholder large={large} />;
}
