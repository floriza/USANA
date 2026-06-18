"use client";

import { signOut } from "next-auth/react";
import { Bell, LogOut } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 shrink-0">
      <div className="flex-1" />

      <button className="p-2 text-gray-500 hover:text-gray-700 relative">
        <Bell className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-900">
            {user.name || user.email}
          </p>
          <p className="text-xs text-gray-500">{user.role}</p>
        </div>
        <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {getInitials(user.name || user.email || "A")}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
