import Link from "next/link";
import { createClient } from "@infrastructure/auth/supabase/server";
import { profileContainer } from "@infrastructure/di/ProfileContainer";
import { UserId } from "@domain/profile/value-objects/UserId";
import { getUserRoadmapsListAction } from "@interfaces/web/actions/learningActions";
import { learningContainer } from "@infrastructure/di/LearningContainer";
import { Button } from "@/components/ui/button";
import { RoadmapSwitcher } from "./RoadmapSwitcher";
import { UserMenu } from "./UserMenu";

interface SiteHeaderProps {
  currentRoadmapId?: string;
}

export async function SiteHeader({
  currentRoadmapId,
}: SiteHeaderProps): Promise<React.ReactElement> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-xl font-bold tracking-tight text-[#1D2D50]">
              PIVOT
            </span>
          </Link>
          <Button
            size="default"
            asChild
            className="bg-[#1D2D50] text-white hover:bg-[#152340] transition-colors font-medium"
          >
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </header>
    );
  }

  const userRepository = profileContainer.getUserRepository();
  const careerGoalRepository = learningContainer.getCareerGoalRepository();
  const userId = UserId.create(authUser.id);
  const [dbUser, roadmapsResult, careerGoals] = await Promise.all([
    userRepository.findById(userId).catch(() => null),
    getUserRoadmapsListAction(),
    careerGoalRepository.findByUserId(userId).catch(() => []),
  ]);
  const latestGoal =
    careerGoals.length > 0
      ? careerGoals.reduce((latest, g) =>
          g.createdAt > latest.createdAt ? g : latest,
        )
      : null;

  const userName =
    dbUser?.name ||
    authUser.user_metadata?.name ||
    authUser.email?.split("@")[0] ||
    "User";
  const userEmail = dbUser?.email.value || authUser.email || "";
  const roadmaps = roadmapsResult.success ? (roadmapsResult.data ?? []) : [];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Left: Logo + Context Switcher */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-xl font-bold tracking-tight text-[#1D2D50]">
              PIVOT
            </span>
          </Link>

          {roadmaps.length > 0 && (
            <>
              <span className="text-slate-300">/</span>
              <RoadmapSwitcher
                currentRoadmapId={currentRoadmapId}
                roadmaps={roadmaps}
              />
            </>
          )}
        </div>

        {/* Right: User Menu */}
        <UserMenu
          userName={userName}
          userEmail={userEmail}
          userLocation={dbUser?.location ?? null}
          userBio={dbUser?.bio ?? null}
          userSeniority={dbUser?.currentSeniority ?? null}
          userYearsExperience={dbUser?.yearsExperience ?? null}
          userCurrentRole={latestGoal?.currentRole ?? null}
        />
      </div>
    </header>
  );
}
