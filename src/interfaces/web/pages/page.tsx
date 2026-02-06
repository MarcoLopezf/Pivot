import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@infrastructure/auth/supabase/server";
import { getLastActiveRoadmapIdAction } from "@interfaces/web/actions/learningActions";
import { Button } from "@/components/ui/button";

/**
 * Root Page (Server Component)
 *
 * Smart routing logic:
 * - Not logged in: Show landing page (Hero, Features, CTA)
 * - Logged in + has roadmap: Redirect to last active roadmap
 * - Logged in + no roadmap: Redirect to onboarding
 *
 * @layer Interface (Web)
 */
export default async function HomePage(): Promise<React.ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const result = await getLastActiveRoadmapIdAction();

    if (result.success && result.data) {
      redirect(`/roadmap/${result.data}`);
    }

    redirect("/onboarding");
  }

  // Landing page for unauthenticated users
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-24 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Your career transition,{" "}
            <span className="text-primary">reimagined with AI</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            PIVOT AI creates personalized learning roadmaps powered by
            artificial intelligence. Set your career goal, and we build the path
            to get you there.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/40 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
            How it works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
                1
              </div>
              <h3 className="text-lg font-semibold">Set Your Goal</h3>
              <p className="text-sm text-muted-foreground">
                Tell us your current role and where you want to go. Upload your
                CV for smarter recommendations.
              </p>
            </div>
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
                2
              </div>
              <h3 className="text-lg font-semibold">Get Your Roadmap</h3>
              <p className="text-sm text-muted-foreground">
                AI generates a personalized learning path with modules,
                projects, and resources tailored to you.
              </p>
            </div>
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
                3
              </div>
              <h3 className="text-lg font-semibold">Learn & Track</h3>
              <p className="text-sm text-muted-foreground">
                Progress through modules, complete projects, and track your
                career transition journey.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
