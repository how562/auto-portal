"use client";

import Image from "next/image";

interface InventoryCampaignBannerProps {
  /** CMS/admin banner URL — omit or empty to collapse the zone. */
  imageUrl?: string | null;
  alt?: string;
}

export function InventoryCampaignBanner({
  imageUrl,
  alt = "",
}: InventoryCampaignBannerProps) {
  if (!imageUrl?.trim()) return null;

  return (
    <div className="portal-container pt-3 sm:pt-4">
      <div className="relative h-[72px] overflow-hidden rounded-lg border border-[var(--line-dark)] bg-white shadow-tight sm:h-[120px] lg:h-[140px]">
        <Image
          src={imageUrl}
          alt={alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover object-center"
        />
      </div>
    </div>
  );
}
