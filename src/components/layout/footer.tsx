import Link from "next/link";
import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer style={{ background: "#0F2218", color: "rgba(255,255,255,0.55)" }}>
      {/* Distributor notice bar */}
      <div
        className="border-b"
        style={{ background: "#162E1E", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="container mx-auto px-4 max-w-7xl py-3">
          <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.45)" }}>
            <span className="font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>Distributor Notice:</span>{" "}
            This website is operated by an Independent USANA Distributor and is not owned or operated by USANA Health Sciences, Inc.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#2D6A4F" }}>
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm leading-tight text-white" style={{ fontFamily: "var(--font-playfair,serif)" }}>
                  USANA Store
                </div>
                <div className="text-xs leading-tight" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Philippines
                </div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              Your trusted source for premium USANA health and wellness products in the Philippines.
            </p>
            <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.3)" }}>
              Independent USANA Distributor
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold mb-5" style={{ color: "rgba(255,255,255,0.85)" }}>
              Shop
            </h3>
            <ul className="space-y-2.5">
              {[
                ["Supplements", "/products?category=supplements"],
                ["Nutritionals", "/products?category=nutritionals"],
                ["Weight Management", "/products?category=shakes-and-weight-management"],
                ["Skin Care", "/products?category=skin-care"],
                ["Personal Care", "/products?category=personal-care"],
                ["All Products", "/products"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm transition-colors duration-150 hover:text-white"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold mb-5" style={{ color: "rgba(255,255,255,0.85)" }}>
              My Account
            </h3>
            <ul className="space-y-2.5">
              {[
                ["Login / Register", "/login"],
                ["My Orders", "/account/orders"],
                ["My Wishlist", "/account/wishlist"],
                ["Reward Points", "/account/rewards"],
                ["My Addresses", "/account/addresses"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold mb-5" style={{ color: "rgba(255,255,255,0.85)" }}>
              Information
            </h3>
            <ul className="space-y-2.5">
              {[
                ["Privacy Policy", "/privacy-policy"],
                ["Terms & Conditions", "/terms"],
                ["Refund Policy", "/refund-policy"],
                ["Shipping Policy", "/shipping-policy"],
                ["Cookie Policy", "/cookie-policy"],
                ["Product Disclaimer", "/disclaimer"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="mt-12 pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* FDA disclaimer */}
          <div
            className="rounded-2xl p-5 mb-8"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-xs leading-relaxed text-center" style={{ color: "rgba(255,255,255,0.35)" }}>
              These statements have not been evaluated by the Food and Drug Administration (FDA) Philippines.
              These products are not intended to diagnose, treat, cure, or prevent any disease.
              Food supplements should not be used as a substitute for a varied diet and healthy lifestyle.
              Consult your healthcare provider before starting any supplement regimen.
            </p>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              © {new Date().getFullYear()} USANA Store Philippines. Independent USANA Distributor. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              <span>Secured by SSL</span>
              <span className="opacity-40">·</span>
              <span>Payments via PayMongo</span>
              <span className="opacity-40">·</span>
              <span>Data Privacy Act Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
