"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImagesProps {
  images: Array<{ id: string; url: string; altText: string | null }>;
  thumbnail: string | null;
  name: string;
}

export function ProductImages({ images, thumbnail, name }: ProductImagesProps) {
  const allImages = [
    ...(thumbnail ? [{ id: "thumb", url: thumbnail, altText: name }] : []),
    ...images.filter((img) => img.url !== thumbnail),
  ];

  const [selected, setSelected] = useState(allImages[0]?.url || null);

  if (!allImages.length) {
    return (
      <div className="aspect-square rounded-2xl bg-blue-50 flex items-center justify-center text-6xl">
        💊
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50">
        <Image
          src={selected || allImages[0].url}
          alt={name}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {allImages.map((img) => (
            <button
              key={img.id}
              onClick={() => setSelected(img.url)}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                selected === img.url
                  ? "border-blue-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="relative w-full h-full">
                <Image
                  src={img.url}
                  alt={img.altText || name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
