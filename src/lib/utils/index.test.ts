import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  calculateDiscountPercent,
  generateSlug,
  buildPaginationMeta,
  truncate,
  getInitials,
} from "./index";

describe("formatCurrency", () => {
  it("formats PHP currency correctly", () => {
    expect(formatCurrency(1000)).toContain("1,000");
    expect(formatCurrency(1000)).toContain("₱");
  });

  it("handles string input", () => {
    expect(formatCurrency("2500")).toContain("2,500");
  });

  it("formats with 2 decimal places", () => {
    expect(formatCurrency(99.5)).toContain("99.50");
  });
});

describe("calculateDiscountPercent", () => {
  it("calculates percentage discount correctly", () => {
    expect(calculateDiscountPercent(1000, 800)).toBe(20);
    expect(calculateDiscountPercent(1000, 500)).toBe(50);
  });

  it("returns 0 for invalid original price", () => {
    expect(calculateDiscountPercent(0, 500)).toBe(0);
  });

  it("rounds to nearest integer", () => {
    expect(calculateDiscountPercent(1000, 667)).toBe(33);
  });
});

describe("generateSlug", () => {
  it("converts name to slug", () => {
    expect(generateSlug("USANA CellSentials")).toBe("usana-cellsentials");
  });

  it("handles special characters", () => {
    expect(generateSlug("Core Minerals & Vitamins")).toBe("core-minerals-and-vitamins");
  });
});

describe("buildPaginationMeta", () => {
  it("calculates pagination metadata correctly", () => {
    const meta = buildPaginationMeta(100, 1, 10);
    expect(meta.total).toBe(100);
    expect(meta.totalPages).toBe(10);
    expect(meta.hasNextPage).toBe(true);
    expect(meta.hasPrevPage).toBe(false);
  });

  it("identifies last page correctly", () => {
    const meta = buildPaginationMeta(100, 10, 10);
    expect(meta.hasNextPage).toBe(false);
    expect(meta.hasPrevPage).toBe(true);
  });
});

describe("truncate", () => {
  it("truncates long strings", () => {
    const result = truncate("Hello World", 5);
    expect(result).toBe("Hello...");
    expect(result.length).toBe(8);
  });

  it("returns unchanged string if shorter than limit", () => {
    expect(truncate("Hi", 10)).toBe("Hi");
  });
});

describe("getInitials", () => {
  it("returns initials from full name", () => {
    expect(getInitials("Juan dela Cruz")).toBe("JD");
  });

  it("handles single name", () => {
    expect(getInitials("Juan")).toBe("J");
  });
});
