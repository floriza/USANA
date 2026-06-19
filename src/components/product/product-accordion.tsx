"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Star } from "lucide-react";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: "#EAE7DF", background: "#fff" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors"
        style={{ background: open ? "#F8F6F0" : "#fff" }}
      >
        <span
          className="font-semibold text-base"
          style={{ fontFamily: "var(--font-playfair,serif)", color: "var(--foreground)" }}
        >
          {title}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 ml-4"
        >
          <ChevronDown className="w-5 h-5" style={{ color: "#2D6A4F" }} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-6 pb-6 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SupplementInfo {
  servingSize?: string | null;
  servingsPerContainer?: number | null;
  ingredients?: string | null;
  directions?: string | null;
  warnings?: string | null;
  storageInstructions?: string | null;
}

interface Review {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  isVerified: boolean;
  user: { name?: string | null };
}

interface ProductAccordionProps {
  description: string;
  supplementInfo: SupplementInfo;
  reviews: Review[];
}

export function ProductAccordion({ description, supplementInfo, reviews }: ProductAccordionProps) {
  const hasSupplementInfo =
    supplementInfo.servingSize ||
    supplementInfo.ingredients ||
    supplementInfo.directions ||
    supplementInfo.warnings;

  return (
    <div className="space-y-3">
      {/* Description */}
      <AccordionItem title="Product Description" defaultOpen>
        <div
          className="prose prose-sm max-w-none"
          style={{ color: "var(--muted)" }}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </AccordionItem>

      {/* Supplement facts */}
      {hasSupplementInfo && (
        <AccordionItem title="Supplement Facts & Directions">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {supplementInfo.servingSize && (
              <div className="p-4 rounded-xl" style={{ background: "#F8F6F0" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#2D6A4F" }}>
                  Serving Information
                </p>
                <p className="text-sm" style={{ color: "var(--foreground)" }}>
                  Serving Size: {supplementInfo.servingSize}
                </p>
                {supplementInfo.servingsPerContainer && (
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    Servings per container: {supplementInfo.servingsPerContainer}
                  </p>
                )}
              </div>
            )}
            {supplementInfo.ingredients && (
              <div className="p-4 rounded-xl" style={{ background: "#F8F6F0" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#2D6A4F" }}>
                  Ingredients
                </p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--muted)" }}>
                  {supplementInfo.ingredients}
                </p>
              </div>
            )}
            {supplementInfo.directions && (
              <div className="p-4 rounded-xl" style={{ background: "#F8F6F0" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#2D6A4F" }}>
                  Directions for Use
                </p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--muted)" }}>
                  {supplementInfo.directions}
                </p>
              </div>
            )}
            {supplementInfo.warnings && (
              <div className="p-4 rounded-xl" style={{ background: "#FFF5F5", border: "1px solid #FED7D7" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#C53030" }}>
                  Warnings
                </p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "#C53030" }}>
                  {supplementInfo.warnings}
                </p>
              </div>
            )}
            {supplementInfo.storageInstructions && (
              <div className="p-4 rounded-xl" style={{ background: "#F8F6F0" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#2D6A4F" }}>
                  Storage
                </p>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  {supplementInfo.storageInstructions}
                </p>
              </div>
            )}
          </div>
        </AccordionItem>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <AccordionItem title={`Customer Reviews (${reviews.length})`}>
          <div className="space-y-5">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="pb-5 last:pb-0 border-b last:border-0"
                style={{ borderColor: "#EAE7DF" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5"
                        style={{ color: i < review.rating ? "#E9C46A" : "#EAE7DF", fill: i < review.rating ? "#E9C46A" : "#EAE7DF" }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                    {review.user.name || "Customer"}
                  </span>
                  {review.isVerified && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "#ECFDF5", color: "#2D6A4F", fontWeight: 500 }}
                    >
                      Verified
                    </span>
                  )}
                </div>
                {review.title && (
                  <p className="font-medium text-sm mb-1" style={{ color: "var(--foreground)" }}>
                    {review.title}
                  </p>
                )}
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {review.body}
                </p>
              </div>
            ))}
          </div>
        </AccordionItem>
      )}
    </div>
  );
}
