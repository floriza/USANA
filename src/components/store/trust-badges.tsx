import { Shield, Truck, RotateCcw, Headphones } from "lucide-react";

const BADGES = [
  {
    icon: Shield,
    title: "100% Authentic",
    description: "Direct from certified USANA distributor",
    accent: "#2D6A4F",
    bg: "#ECFDF5",
  },
  {
    icon: Truck,
    title: "Nationwide Delivery",
    description: "Metro Manila to Mindanao",
    accent: "#D4A373",
    bg: "#FFF7ED",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day return policy",
    accent: "#40916C",
    bg: "#F0FDF4",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description: "Mon-Sat, 9AM to 6PM",
    accent: "#52B788",
    bg: "#ECFDF5",
  },
];

export function TrustBadges() {
  return (
    <section className="container mx-auto px-4 max-w-7xl py-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {BADGES.map(({ icon: Icon, title, description, accent, bg }) => (
          <div
            key={title}
            className="flex items-start gap-3.5 p-5 rounded-2xl transition-all duration-200 group hover:-translate-y-0.5"
            style={{
              background: "#fff",
              border: "1px solid #EAE7DF",
              boxShadow: "0 1px 6px rgba(28,43,32,0.05)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{ background: bg }}
            >
              <Icon className="w-5 h-5" style={{ color: accent }} />
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight" style={{ color: "var(--foreground)" }}>
                {title}
              </p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--muted)" }}>
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
