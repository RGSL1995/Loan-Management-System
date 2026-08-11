"use client";

import { logout } from "@/app/actions/auth";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 transition-colors rounded-lg hover:bg-red-50"
    >
      <LogOut size={16} />
      Sign out
    </button>
  );
}
