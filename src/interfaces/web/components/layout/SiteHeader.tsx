import Link from "next/link";
import { createClient } from "@infrastructure/auth/supabase/server";
import { profileContainer } from "@infrastructure/di/ProfileContainer";
import { UserId } from "@domain/profile/value-objects/UserId";
import { getUserRoadmapsListAction } from "@interfaces/web/actions/learningActions";
import { Button } from "@/components/ui/button";
import { RoadmapSwitcher } from "./RoadmapSwitcher";
import { UserMenu } from "./UserMenu";

interface SiteHeaderProps {
  currentRoadmapId?: string;
}

/**
 * SiteHeader - Global Navigation Header (Server Component)
 *
 * Fetches user session and roadmaps list server-side.
 * Renders the logo, context switcher, and user menu.
 * Shows login button for unauthenticated users.
 *
 * @layer Interface (Web)
 */
export async function SiteHeader({
  currentRoadmapId,
}: SiteHeaderProps): Promise<React.ReactElement> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  // Unauthenticated: show minimal header with logo + login
  if (!authUser) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">PIVOT</span>
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </header>
    );
  }

  // Fetch user profile from DB and roadmaps list in parallel
  const userRepository = profileContainer.getUserRepository();
  const [dbUser, roadmapsResult] = await Promise.all([
    userRepository.findById(UserId.create(authUser.id)),
    getUserRoadmapsListAction(),
  ]);

  const userName =
    dbUser?.name ||
    authUser.user_metadata?.name ||
    authUser.email?.split("@")[0] ||
    "User";
  const userEmail = dbUser?.email.value || authUser.email || "";
  const roadmaps = roadmapsResult.success ? (roadmapsResult.data ?? []) : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Left: Logo + Context Switcher */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">PIVOT</span>
          </Link>

          {roadmaps.length > 0 && (
            <>
              <span className="text-muted-foreground/50">/</span>
              <RoadmapSwitcher
                currentRoadmapId={currentRoadmapId}
                roadmaps={roadmaps}
              />
            </>
          )}
        </div>

        {/* Right: User Menu */}
        <UserMenu userName={userName} userEmail={userEmail} />
      </div>
    </header>
  );
}
