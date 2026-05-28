import { CAVENDER_COMMITMENT_BACKDROP_PHOTOS } from "@/lib/cavenderCommitmentBackdrop";

const PHOTO_SLOTS = [
  "cc-memo-photo--a",
  "cc-memo-photo--b",
  "cc-memo-photo--c",
  "cc-memo-photo--d",
  "cc-memo-photo--e",
  "cc-memo-photo--f",
] as const;

/** Photographic backdrop — American flags and service members saluting (not logos/icons). */
export function CommitmentMemoBackdrop({ fixed = true }: { fixed?: boolean }) {
  return (
    <div
      className={`cc-memo-bg${fixed ? " cc-memo-bg--fixed" : " cc-memo-bg--ambient"}`}
      aria-hidden
    >
      <CommitmentMemoWatermark />
    </div>
  );
}

export function CommitmentMemoWatermark({ className = "" }: { className?: string }) {
  return (
    <div className={`cc-memo-watermark ${className}`.trim()} aria-hidden>
      {CAVENDER_COMMITMENT_BACKDROP_PHOTOS.map((photo, index) => (
        <MemoBackdropPhoto
          key={`${photo.id}-${index}`}
          src={photo.src}
          variant={photo.id}
          className={PHOTO_SLOTS[index] ?? "cc-memo-photo--a"}
        />
      ))}
    </div>
  );
}

function MemoBackdropPhoto({
  src,
  variant,
  className,
}: {
  src: string;
  variant: "flag" | "salute";
  className: string;
}) {
  return (
    <span
      className={`cc-memo-photo cc-memo-photo--${variant} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="cc-memo-photo__img" loading="lazy" decoding="async" />
    </span>
  );
}
