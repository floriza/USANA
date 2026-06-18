import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateContent } from "./validator";

// Mock prisma
vi.mock("@/lib/db", () => ({
  default: {
    complianceBannedPhrase: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

describe("Compliance Validator", () => {
  describe("Disease claims", () => {
    it("blocks content containing disease cure claims", async () => {
      const result = await validateContent("This product treats diabetes and helps patients recover.");
      expect(result.isBlocked).toBe(true);
      expect(result.violations.some((v) => v.phrase.includes("treats diabetes"))).toBe(true);
    });

    it("blocks cancer cure claims", async () => {
      const result = await validateContent("Our supplement cures cancer naturally.");
      expect(result.isBlocked).toBe(true);
    });

    it("blocks testimonials claiming disease cures", async () => {
      const result = await validateContent("This cured my diabetes after just one month.");
      expect(result.isBlocked).toBe(true);
    });
  });

  describe("Income claims", () => {
    it("blocks guaranteed income claims", async () => {
      const result = await validateContent("Join us for guaranteed income and financial success.");
      expect(result.isBlocked).toBe(true);
    });

    it("blocks get rich fast claims", async () => {
      const result = await validateContent("How to get rich fast with USANA products.");
      expect(result.isBlocked).toBe(true);
    });
  });

  describe("Misleading claims", () => {
    it("flags miracle supplement as critical", async () => {
      const result = await validateContent("This is a miracle supplement for weight loss.");
      expect(result.hasCritical).toBe(true);
      expect(result.isBlocked).toBe(false);
    });

    it("flags guaranteed results as critical", async () => {
      const result = await validateContent("Guaranteed results in 30 days or money back.");
      expect(result.hasCritical).toBe(true);
    });
  });

  describe("Clean content", () => {
    it("passes compliant product descriptions", async () => {
      const result = await validateContent(
        "This supplement provides comprehensive nutritional support. " +
        "Contains essential vitamins and minerals for daily health maintenance. " +
        "Suitable for adults. Consult your healthcare provider before use."
      );
      expect(result.isBlocked).toBe(false);
      expect(result.violations.length).toBe(0);
    });

    it("passes standard marketing copy", async () => {
      const result = await validateContent(
        "Support your wellness journey with USANA's science-based nutrition. " +
        "Formulated with quality ingredients to complement a healthy lifestyle."
      );
      expect(result.violations.length).toBe(0);
    });
  });

  describe("Severity levels", () => {
    it("correctly identifies BLOCKED severity", async () => {
      const result = await validateContent("This supplement eliminates arthritis completely.");
      const blocked = result.violations.filter((v) => v.severity === "BLOCKED");
      expect(blocked.length).toBeGreaterThan(0);
    });

    it("returns violation context", async () => {
      const result = await validateContent(
        "Some prefix text here. This product treats diabetes in patients. More text."
      );
      const violation = result.violations[0];
      expect(violation.context).toBeTruthy();
      expect(violation.context.length).toBeGreaterThan(0);
    });
  });
});
