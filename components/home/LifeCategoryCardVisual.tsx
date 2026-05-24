"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import type { LifeCategoryId } from "@/lib/lifeFilters";
import { getLifeCategoryPlaceholder } from "@/lib/lifeCategoryVisuals";

interface LifeCategoryCardVisualProps {
  categoryId: LifeCategoryId;
  imageUrl?: string;
}

function LifeCategoryPlaceholderArt({
  categoryId,
}: {
  categoryId: LifeCategoryId;
}) {
  const style = getLifeCategoryPlaceholder(categoryId);

  return (
    <div
      className="absolute inset-0"
      style={{ background: style.background }}
      aria-hidden
    >
      <div
        className="absolute -right-6 top-[18%] h-[55%] w-[70%] rounded-[40%] blur-[1px]"
        style={{ backgroundColor: style.accent }}
      />
      <div
        className="absolute bottom-[12%] right-[8%] h-[38%] w-[48%] rounded-full opacity-80"
        style={{ backgroundColor: style.accentMuted }}
      />
      <div
        className="absolute right-[22%] top-[8%] h-14 w-14 rounded-full opacity-60"
        style={{ backgroundColor: style.accentMuted }}
      />
    </div>
  );
}

export function LifeCategoryCardVisual({
  categoryId,
  imageUrl,
}: LifeCategoryCardVisualProps) {
  const [showImage, setShowImage] = useState(Boolean(imageUrl));

  const onImageError = useCallback(() => {
    setShowImage(false);
  }, []);

  return (
    <div
      className="absolute right-0 top-0 z-0 h-[50%] w-[48%] sm:inset-y-0 sm:h-full sm:w-[50%]"
      aria-hidden
    >
      <div className="life-card-visual-media relative h-full w-full overflow-hidden transition-transform duration-500 ease-out group-hover:translate-x-0.5">
        {imageUrl && showImage ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 48vw, 50vw"
            className="object-cover object-[left_center]"
            onError={onImageError}
          />
        ) : (
          <LifeCategoryPlaceholderArt categoryId={categoryId} />
        )}
      </div>
    </div>
  );
}
