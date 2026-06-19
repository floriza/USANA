import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthDisclaimerProps {
  variant?: "inline" | "banner" | "minimal";
  className?: string;
  /** Pass false to suppress the disclaimer for FDA-evaluated products */
  showDisclaimer?: boolean;
}

export function HealthDisclaimer({
  variant = "inline",
  className,
  showDisclaimer = true,
}: HealthDisclaimerProps) {
  if (!showDisclaimer) return null;
  if (variant === "minimal") {
    return (
      <p className={cn("text-xs text-gray-500 italic", className)}>
        *These statements have not been evaluated by the FDA. Not intended to
        diagnose, treat, cure, or prevent any disease.
      </p>
    );
  }

  if (variant === "banner") {
    return (
      <section className={cn("bg-amber-50 border-y border-amber-200 py-4", className)}>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Important Notice</p>
              <p>
                These statements have not been evaluated by the Food and Drug
                Administration (FDA) Philippines. These products are not
                intended to diagnose, treat, cure, or prevent any disease. Food
                supplements should not be used as a substitute for a varied diet
                and healthy lifestyle. Consult your healthcare provider before
                starting any supplement regimen.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className={cn("bg-amber-50 border border-amber-200 rounded-xl p-4", className)}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-1">Health Disclaimer</p>
          <p>
            These statements have not been evaluated by the Food and Drug
            Administration (FDA) Philippines. These products are not intended to
            diagnose, treat, cure, or prevent any disease. Consult your
            healthcare provider before starting any supplement program.
          </p>
          <p className="mt-1 text-xs text-amber-700">
            This website is operated by an Independent USANA Distributor and is
            not owned or operated by USANA Health Sciences, Inc.
          </p>
        </div>
      </div>
    </div>
  );
}
