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
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center gap-8 bg-white px-4 py-24 text-center">
        <div className="max-w-3xl space-y-6">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            ONE PIVOT AT TIMES UNIVERSITY
          </p>
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Your career transition,{" "}
            <span className="text-[#1D2D50]">reimagined with AI</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-slate-600">
            PIVOT AI creates personalized learning roadmaps powered by
            artificial intelligence. Set your career goal, and we build the path
            to get you there.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              asChild
              className="bg-[#1D2D50] text-white hover:bg-[#152340] transition-colors"
            >
              <Link href="/login">Get Started</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-slate-900">
            How it works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-3 rounded-lg bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-700">
                1
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Set Your Goal
              </h3>
              <p className="text-sm text-slate-600">
                Tell us your current role and where you want to go. Upload your
                CV for smarter recommendations tailored to your experience.
              </p>
            </div>
            <div className="space-y-3 rounded-lg bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-700">
                2
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Get Your Roadmap
              </h3>
              <p className="text-sm text-slate-600">
                AI generates a personalized learning path with modules, real
                world projects, and curated resources tailored specifically for
                you.
              </p>
            </div>
            <div className="space-y-3 rounded-lg bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-700">
                3
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Learn & Track
              </h3>
              <p className="text-sm text-slate-600">
                Progress through curated modules, complete projects, and track
                your career transition journey in real time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Powered by AI Section */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left: Text Content */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Powered by Advanced AI Models
              </h2>
              <p className="text-lg text-slate-600">
                Our engine analyzes millions of job descriptions and successful
                career transitions to create the most effective roadmap for your
                transition.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1E5F74] text-white">
                    <span className="text-xs">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      Dynamic skill gap analysis
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1E5F74] text-white">
                    <span className="text-xs">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      Real-time market trend adaptation
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1E5F74] text-white">
                    <span className="text-xs">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      Mentor matching algorithm
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Dashboard Preview Placeholder */}
            <div className="relative">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-[#1D2D50] p-6 shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-300">
                      Career Progress
                    </p>
                    <p className="text-xs text-slate-400">Last 6 months</p>
                  </div>
                  <div className="h-64 rounded bg-[#133B5C] p-4">
                    {/* Placeholder Chart */}
                    <div className="flex h-full items-end justify-between gap-2">
                      {[40, 60, 45, 75, 55, 85, 70, 90].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-[#1E5F74] to-[#1E5F74]/50"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="rounded bg-[#133B5C] p-3">
                      <p className="text-xs text-slate-400">Completed</p>
                      <p className="text-lg font-bold text-white">24</p>
                    </div>
                    <div className="rounded bg-[#133B5C] p-3">
                      <p className="text-xs text-slate-400">In Progress</p>
                      <p className="text-lg font-bold text-white">8</p>
                    </div>
                    <div className="rounded bg-[#133B5C] p-3">
                      <p className="text-xs text-slate-400">Skills</p>
                      <p className="text-lg font-bold text-white">32</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-[#1D2D50] px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to pivot your career?
          </h2>
          <p className="mb-8 text-lg text-slate-300">
            Join thousands of professionals who have successfully transitioned
            into tech.
          </p>
          <Button
            size="lg"
            asChild
            className="bg-[#FCDAB7] text-slate-900 hover:bg-[#f5c9a0] transition-colors font-semibold"
          >
            <Link href="/login">Start Your Free Assessment</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
