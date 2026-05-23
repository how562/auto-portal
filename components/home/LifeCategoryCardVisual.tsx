"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import type { LifeCategoryId } from "@/lib/lifeFilters";
import { getLifeCategoryPlaceholder } from "@/lib/lifeCategoryVisuals";

interface LifeCategoryCardVisualProps {
  categoryId: LifeCategoryId;
  imageUrl?: string;
  featured?: boolean;
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
  featured = false,
}: LifeCategoryCardVisualProps) {
  const [showImage, setShowImage] = useState(Boolean(imageUrl));
  const [imageReady, setImageReady] = useState(false);
  const usePlaceholder = !imageUrl || !showImage;

  const onImageError = useCallback(() => {
    setShowImage(false);
    setImageReady(false);
  }, []);

  const widthClass = featured
    ? "w-[46%] max-w-[13rem] sm:max-w-[15rem]"
    : "w-[44%] max-w-[10.5rem] sm:max-w-[12rem]";

  return (
    <div
      className={`pointer-events-none absolute inset-y-0 -right-1 sm:-right-2 ${widthClass}`}
      aria-hidden
    >
      <div
        className={`life-card-visual-media relative h-full w-full transition-[opacity,transform] duration-500 ease-out group-hover:translate-x-1 ${
          usePlaceholder || imageReady ? "opacity-100" : "opacity-0"
        }`}
      >
        {imageUrl && showImage ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 40vw, 200px"
            className={`object-cover object-center transition-opacity duration-700 ease-out ${
              imageReady ? "opacity-90" : "opacity-0"
            }`}
            onLoad={() => setImageReady(true)}
            onError={onImageError}
          />
        ) : (
          <LifeCategoryPlaceholderArt categoryId={categoryId} />
        )}
      </div>

      {/* Fade image into card background */}
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-r from-white via-white/90 to-white/0"
        aria-hidden
      />
      <div
        className="absolute inset-y-0 left-0 z-[2] w-1/3 bg-gradient-to-r from-white to-transparent"
        aria-hidden
      />
    </div>
  );
}
