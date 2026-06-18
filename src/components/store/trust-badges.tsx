import { Shield, Truck, RotateCcw, Headphones } from "lucide-react";

const BADGES = [
  {
    icon: Shield,
    title: "100% Authentic",
    description: "Direct from USANA distributor",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Truck,
    title: "Nationwide Delivery",
    description: "Metro Manila to Mindanao",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day return policy",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description: "Mon-Sat 9AM-6PM",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

export function TrustBadges() {
  return (
    <section className="container mx-auto px-4 max-w-7xl py-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {BADGES.map(({ icon: Icon, title, description, color, bg }) => (
          <div
            key={title}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100"
          >
            <div className={`${bg} p-2.5 rounded-xl shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{title}</p>
              <p className="text-gray-500 text-xs">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
