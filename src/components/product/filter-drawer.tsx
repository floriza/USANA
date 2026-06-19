"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal } from "lucide-react";
import { ProductFilters } from "./product-filters";

export function FilterDrawerTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors"
        style={{
          background: "#fff",
          borderColor: "#EAE7DF",
          color: "var(--foreground)",
        }}
      >
        <SlidersHorizontal className="w-4 h-4" style={{ color: "#2D6A4F" }} />
        Filters
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[90]"
              style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-[91] w-80 max-w-[85vw] flex flex-col shadow-2xl overflow-y-auto"
              style={{ background: "#FAFAF7" }}
            >
              <div
                className="flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10"
                style={{ borderColor: "#EAE7DF", background: "#FAFAF7" }}
              >
                <h2
                  className="text-base font-bold"
                  style={{ fontFamily: "var(--font-playfair,serif)", color: "var(--foreground)" }}
                >
                  Filter Products
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                  style={{ background: "#F2EFE8" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 flex-1">
                <ProductFilters />
              </div>
              <div className="px-5 pb-6 sticky bottom-0" style={{ background: "#FAFAF7" }}>
                <button
                  onClick={() => setOpen(false)}
                  className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "#2D6A4F" }}
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
