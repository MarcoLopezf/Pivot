"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import { logoutAction } from "@interfaces/web/actions/authActions";

interface UserMenuProps {
  userName: string;
  userEmail: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserMenu({
  userName,
  userEmail,
}: UserMenuProps): React.ReactElement {
  const handleLogout = async (): Promise<void> => {
    try {
      await logoutAction();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-slate-300 hover:opacity-80 transition-opacity">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-slate-900 text-white text-sm font-medium">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[200px]">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem disabled className="gap-2">
          <User className="h-4 w-4" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="gap-2 text-destructive hover:text-destructive focus:text-destructive"
          onSelect={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
