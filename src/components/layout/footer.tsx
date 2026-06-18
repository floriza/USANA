import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      {/* Disclaimer banner */}
      <div className="bg-yellow-50 border-t border-yellow-200">
        <div className="container mx-auto px-4 max-w-7xl py-3">
          <p className="text-xs text-yellow-800 text-center">
            <strong>Distributor Notice:</strong> This website is operated by an
            Independent USANA Distributor and is not owned or operated by USANA
            Health Sciences, Inc.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <div>
                <div className="font-bold text-white text-sm">USANA Store</div>
                <div className="text-xs text-gray-400">Philippines</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your trusted source for premium USANA health and wellness products
              in the Philippines.
            </p>
            <p className="text-xs text-gray-500 mt-3">
              Independent USANA Distributor
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Shop</h3>
            <ul className="space-y-2 text-sm">
              {[
                ["Supplements", "/products?category=supplements"],
                ["Nutritionals", "/products?category=nutritionals"],
                ["Weight Management", "/products?category=shakes-and-weight-management"],
                ["Skin Care", "/products?category=skin-care"],
                ["Personal Care", "/products?category=personal-care"],
                ["All Products", "/products"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">
              My Account
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                ["Login / Register", "/login"],
                ["My Orders", "/account/orders"],
                ["My Wishlist", "/account/wishlist"],
                ["Reward Points", "/account/rewards"],
                ["My Addresses", "/account/addresses"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">
              Information
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                ["Privacy Policy", "/privacy-policy"],
                ["Terms & Conditions", "/terms"],
                ["Refund Policy", "/refund-policy"],
                ["Shipping Policy", "/shipping-policy"],
                ["Cookie Policy", "/cookie-policy"],
                ["Product Disclaimer", "/disclaimer"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="border-gray-700 my-8" />

        {/* FDA Disclaimer */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <p className="text-xs text-gray-400 leading-relaxed text-center">
            These statements have not been evaluated by the Food and Drug
            Administration. These products are not intended to diagnose, treat,
            cure, or prevent any disease. Food supplements should not be used as
            a substitute for a varied diet and healthy lifestyle. Consult your
            healthcare provider before starting any supplement regimen.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>
            © {new Date().getFullYear()} USANA Store Philippines. Independent
            USANA Distributor. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span>Secured by SSL</span>
            <span>·</span>
            <span>Payments via PayMongo</span>
            <span>·</span>
            <span>Philippine Data Privacy Act Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
