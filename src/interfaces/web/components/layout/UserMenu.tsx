"use client";

import { useState } from "react";
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
import { ProfileDialog, type ProfileData } from "./ProfileDialog";

interface UserMenuProps {
  userName: string;
  userEmail: string;
  userLocation?: string | null;
  userBio?: string | null;
  userSeniority?: string | null;
  userYearsExperience?: number | null;
  userCurrentRole?: string | null;
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
  userLocation = null,
  userBio = null,
  userSeniority = null,
  userYearsExperience = null,
  userCurrentRole = null,
}: UserMenuProps): React.ReactElement {
  const [profileOpen, setProfileOpen] = useState(false);

  const profileData: ProfileData = {
    name: userName,
    email: userEmail,
    location: userLocation ?? null,
    bio: userBio ?? null,
    currentSeniority: userSeniority ?? null,
    yearsExperience: userYearsExperience ?? null,
    currentRole: userCurrentRole ?? null,
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logoutAction();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-slate-300 hover:opacity-80 transition-opacity">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-slate-900 text-white text-sm font-medium">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-[220px] bg-white border-slate-200 text-slate-900"
        >
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-slate-900">{userName}</p>
            <p className="text-xs text-slate-500 truncate">{userEmail}</p>
          </div>

          <DropdownMenuSeparator className="bg-slate-200" />

          <DropdownMenuItem
            className="gap-2 text-slate-700 focus:bg-slate-100 focus:text-slate-900 cursor-pointer"
            onSelect={() => setProfileOpen(true)}
          >
            <User className="h-4 w-4" />
            Profile
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-slate-200" />

          <DropdownMenuItem
            className="gap-2 text-red-600 focus:bg-slate-100 focus:text-red-600"
            onSelect={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        profile={profileData}
      />
    </>
  );
}
