"use client";

import { logoutAction } from "@interfaces/web/actions/authActions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

/**
 * TemporaryLogoutButton - Debug/Testing Component
 *
 * Temporary logout button for testing purposes.
 * This should be removed before production deployment.
 *
 * @layer Interface (Web)
 */
export function TemporaryLogoutButton() {
  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
      className="gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
    >
      <LogOut className="h-4 w-4" />
      Logout (Testing)
    </Button>
  );
}
