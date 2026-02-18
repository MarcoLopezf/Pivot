"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Briefcase, Calendar } from "lucide-react";
import { updateProfileAction } from "@interfaces/web/actions/profileActions";

export interface ProfileData {
  name: string;
  email: string;
  location: string | null;
  bio: string | null;
  currentSeniority: string | null;
  yearsExperience: number | null;
  currentRole: string | null;
}

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ProfileData;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileDialog({
  open,
  onOpenChange,
  profile,
}: ProfileDialogProps): React.ReactElement {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasChanges = name !== profile.name || (bio || null) !== profile.bio;

  function handleOpenChange(nextOpen: boolean): void {
    if (!nextOpen) {
      setName(profile.name);
      setBio(profile.bio ?? "");
      setError(null);
    }
    onOpenChange(nextOpen);
  }

  function handleSave(): void {
    setError(null);
    startTransition(async () => {
      const result = await updateProfileAction(name, bio || null);
      if (result.success) {
        onOpenChange(false);
      } else {
        setError(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Profile</DialogTitle>
          <DialogDescription className="text-slate-500">
            View and edit your profile information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar + info header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-slate-900 text-white text-lg font-medium">
                {getInitials(name || profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {profile.email}
              </p>
              {profile.currentRole && (
                <p className="text-xs text-slate-600 mt-0.5">
                  {profile.currentRole}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                {profile.location && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3 w-3" />
                    {profile.location}
                  </span>
                )}
                {profile.currentSeniority && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Briefcase className="h-3 w-3" />
                    {profile.currentSeniority}
                  </span>
                )}
                {profile.yearsExperience != null && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />
                    {profile.yearsExperience} yr
                    {profile.yearsExperience !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name" className="text-slate-700">
                Name
              </Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={100}
                className="border-slate-200 text-slate-900 focus-visible:ring-slate-400 placeholder:!text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-bio" className="text-slate-700">
                Bio
                <span className="text-slate-400 font-normal ml-1">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="profile-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a bit about yourself..."
                maxLength={500}
                rows={3}
                className="border-slate-200 text-slate-900 focus-visible:ring-slate-400 resize-none placeholder:!text-slate-400"
              />
              <p className="text-xs text-slate-400 text-right">
                {bio.length}/500
              </p>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
            className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || !hasChanges || name.trim().length < 2}
            className="bg-[#1D2D50] text-white hover:bg-[#152340]"
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
