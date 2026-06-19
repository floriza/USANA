"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";

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

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  if (!allImages.length) {
    return (
      <div className="aspect-square rounded-2xl flex items-center justify-center" style={{ background: "#ECFDF5" }}>
        <span className="text-6xl">💊</span>
      </div>
    );
  }

  const selected = allImages[selectedIdx];

  function prev() {
    setSelectedIdx((i) => (i - 1 + allImages.length) % allImages.length);
  }
  function next() {
    setSelectedIdx((i) => (i + 1) % allImages.length);
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div
          className="relative aspect-square rounded-2xl overflow-hidden group cursor-zoom-in"
          style={{ background: "#F8F6F0" }}
          onClick={() => setZoomed(true)}
        >
          <Image
            src={selected.url}
            alt={selected.altText || name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div
            className="absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)" }}
          >
            <ZoomIn className="w-4 h-4" style={{ color: "#2D6A4F" }} />
          </div>
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: "rgba(255,255,255,0.9)" }}
              >
                <ChevronLeft className="w-4 h-4" style={{ color: "#2D6A4F" }} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: "rgba(255,255,255,0.9)" }}
              >
                <ChevronRight className="w-4 h-4" style={{ color: "#2D6A4F" }} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allImages.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setSelectedIdx(i)}
                className="shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200"
                style={{
                  borderColor: i === selectedIdx ? "#2D6A4F" : "#EAE7DF",
                  boxShadow: i === selectedIdx ? "0 0 0 2px rgba(45,106,79,0.15)" : "none",
                }}
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

      {/* Zoom lightbox */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
            onClick={() => setZoomed(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative max-w-3xl w-full aspect-square rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selected.url}
                alt={selected.altText || name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </motion.div>
            <button
              onClick={() => setZoomed(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <X className="w-5 h-5" />
            </button>
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
