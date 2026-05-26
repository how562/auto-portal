export function StaffAvatar({
  label,
  size = "md",
}: {
  label: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg"
      ? "h-24 w-24 text-lg sm:h-28 sm:w-28"
      : size === "sm"
        ? "h-12 w-12 text-xs"
        : "h-16 w-16 text-sm";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-md border border-[var(--line-dark)] bg-[var(--cream-dark)] font-semibold tracking-tight text-[var(--muted)] ${sizeClass}`}
      aria-hidden
    >
      {label}
    </div>
  );
}
