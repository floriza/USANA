"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  BarChart3,
  Settings,
  Shield,
  Archive,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: Archive,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Coupons",
    href: "/admin/coupons",
    icon: Tag,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Compliance",
    href: "/admin/compliance",
    icon: Shield,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN"],
  },
];

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <aside
      className={cn(
        "bg-gray-900 text-gray-300 flex flex-col transition-all duration-200 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">U</span>
            </div>
            <div>
              <div className="font-semibold text-white text-sm">Admin Panel</div>
              <div className="text-xs text-gray-500">USANA Store</div>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors",
            collapsed ? "mx-auto" : "ml-auto"
          )}
        >
          <ChevronLeft
            className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {visibleItems.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/admin/dashboard" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors mx-2 rounded-lg mb-0.5",
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-gray-800">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors",
            collapsed && "justify-center"
          )}
        >
          {!collapsed && "← Back to Store"}
        </Link>
      </div>
    </aside>
  );
}
