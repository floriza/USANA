import type { UserRole } from "@prisma/client";

export const PERMISSIONS = {
  // Products
  "products:read": ["CUSTOMER", "ADMIN", "SUPER_ADMIN"],
  "products:write": ["ADMIN", "SUPER_ADMIN"],
  "products:delete": ["ADMIN", "SUPER_ADMIN"],

  // Orders
  "orders:read:own": ["CUSTOMER", "ADMIN", "SUPER_ADMIN"],
  "orders:read:all": ["ADMIN", "SUPER_ADMIN"],
  "orders:update": ["ADMIN", "SUPER_ADMIN"],
  "orders:cancel:own": ["CUSTOMER"],
  "orders:cancel:any": ["ADMIN", "SUPER_ADMIN"],

  // Customers
  "customers:read": ["ADMIN", "SUPER_ADMIN"],
  "customers:write": ["ADMIN", "SUPER_ADMIN"],
  "customers:delete": ["SUPER_ADMIN"],

  // Inventory
  "inventory:read": ["ADMIN", "SUPER_ADMIN"],
  "inventory:write": ["ADMIN", "SUPER_ADMIN"],

  // Coupons
  "coupons:read": ["ADMIN", "SUPER_ADMIN"],
  "coupons:write": ["ADMIN", "SUPER_ADMIN"],

  // Analytics
  "analytics:read": ["ADMIN", "SUPER_ADMIN"],

  // Settings
  "settings:read": ["ADMIN", "SUPER_ADMIN"],
  "settings:write": ["SUPER_ADMIN"],

  // Compliance
  "compliance:read": ["ADMIN", "SUPER_ADMIN"],
  "compliance:write": ["SUPER_ADMIN"],

  // Reviews
  "reviews:moderate": ["ADMIN", "SUPER_ADMIN"],

  // Content
  "content:write": ["ADMIN", "SUPER_ADMIN"],
  "content:approve": ["SUPER_ADMIN"],

  // Audit
  "audit:read": ["SUPER_ADMIN"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly string[]).includes(role);
}

export function requireRole(roles: UserRole[], userRole: UserRole): boolean {
  return roles.includes(userRole);
}
