import prisma from "@/lib/db";
import type { ComplianceSeverity } from "@prisma/client";

export interface ComplianceViolation {
  phrase: string;
  category: string;
  severity: ComplianceSeverity;
  context: string;
}

export interface ComplianceResult {
  isBlocked: boolean;
  violations: ComplianceViolation[];
  hasCritical: boolean;
  hasWarning: boolean;
}

// Default banned phrases - seeded from DB, fallback hardcoded
const DEFAULT_BANNED_PHRASES = [
  // Disease claims - BLOCKED
  { phrase: "treats diabetes", category: "disease_claim", severity: "BLOCKED" as ComplianceSeverity },
  { phrase: "cures cancer", category: "disease_claim", severity: "BLOCKED" as ComplianceSeverity },
  { phrase: "eliminates arthritis", category: "disease_claim", severity: "BLOCKED" as ComplianceSeverity },
  { phrase: "prevents heart disease", category: "disease_claim", severity: "BLOCKED" as ComplianceSeverity },
  { phrase: "heals kidney failure", category: "disease_claim", severity: "BLOCKED" as ComplianceSeverity },
  { phrase: "cures diabetes", category: "disease_claim", severity: "BLOCKED" as ComplianceSeverity },
  { phrase: "treats cancer", category: "disease_claim", severity: "BLOCKED" as ComplianceSeverity },
  { phrase: "cure for", category: "disease_claim", severity: "BLOCKED" as ComplianceSeverity },
  { phrase: "prescription replacement", category: "drug_claim", severity: "BLOCKED" as ComplianceSeverity },
  { phrase: "medical treatment", category: "drug_claim", severity: "BLOCKED" as ComplianceSeverity },
  { phrase: "guaranteed cure", category: "drug_claim", severity: "BLOCKED" as ComplianceSeverity },
  { phrase: "cured my", category: "testimonial_disease", severity: "BLOCKED" as ComplianceSeverity },
  { phrase: "fixed my disease", category: "testimonial_disease", severity: "BLOCKED" as ComplianceSeverity },
  // Income claims - BLOCKED
  { phrase: "guaranteed income", category: "income_claim", severity: "BLOCKED" as ComplianceSeverity },
  { phrase: "get rich fast", category: "income_claim", severity: "BLOCKED" as ComplianceSeverity },
  { phrase: "earn millions", category: "income_claim", severity: "BLOCKED" as ComplianceSeverity },
  { phrase: "financial freedom guaranteed", category: "income_claim", severity: "BLOCKED" as ComplianceSeverity },
  // Misleading - CRITICAL
  { phrase: "instant weight loss", category: "misleading", severity: "CRITICAL" as ComplianceSeverity },
  { phrase: "guaranteed results", category: "misleading", severity: "CRITICAL" as ComplianceSeverity },
  { phrase: "miracle supplement", category: "misleading", severity: "CRITICAL" as ComplianceSeverity },
  { phrase: "scientifically guaranteed", category: "misleading", severity: "CRITICAL" as ComplianceSeverity },
  // Warnings
  { phrase: "lose weight fast", category: "misleading", severity: "WARNING" as ComplianceSeverity },
  { phrase: "100% effective", category: "misleading", severity: "WARNING" as ComplianceSeverity },
];

export async function validateContent(content: string): Promise<ComplianceResult> {
  const lower = content.toLowerCase();
  const violations: ComplianceViolation[] = [];

  // Load from DB first, fall back to defaults
  let phrases = DEFAULT_BANNED_PHRASES;
  try {
    const dbPhrases = await prisma.complianceBannedPhrase.findMany({
      where: { isActive: true },
    });
    if (dbPhrases.length > 0) {
      phrases = dbPhrases.map((p) => ({
        phrase: p.phrase,
        category: p.category,
        severity: p.severity,
      }));
    }
  } catch {
    // Use defaults if DB unavailable
  }

  for (const item of phrases) {
    if (lower.includes(item.phrase.toLowerCase())) {
      const index = lower.indexOf(item.phrase.toLowerCase());
      const start = Math.max(0, index - 30);
      const end = Math.min(content.length, index + item.phrase.length + 30);
      violations.push({
        ...item,
        context: `...${content.slice(start, end)}...`,
      });
    }
  }

  const isBlocked = violations.some((v) => v.severity === "BLOCKED");
  const hasCritical = violations.some((v) => v.severity === "CRITICAL");
  const hasWarning = violations.some((v) => v.severity === "WARNING");

  return { isBlocked, violations, hasCritical, hasWarning };
}

export async function validateAndLog(
  entityType: string,
  entityId: string,
  content: string,
  checkedById?: string,
  productId?: string
): Promise<ComplianceResult> {
  const result = await validateContent(content);

  if (result.violations.length > 0) {
    const severity = result.isBlocked
      ? "BLOCKED"
      : result.hasCritical
        ? "CRITICAL"
        : "WARNING";

    await prisma.complianceCheck.create({
      data: {
        entityType,
        entityId,
        productId,
        content: content.slice(0, 5000),
        violations: result.violations as object[],
        severity,
        isBlocked: result.isBlocked,
        checkedById,
      },
    });
  }

  return result;
}
