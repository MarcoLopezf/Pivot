import {
  Lightbulb,
  Target,
  BookOpen,
  Sparkles,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import { CreatorCard } from "@interfaces/web/components/about/CreatorCard";

/**
 * AboutPage - Server Component
 *
 * Public page telling the story of PIVOT AI: origin, mission,
 * differentiators, and creator profile.
 *
 * @layer Interface (Web)
 */
export default function AboutPage(): React.ReactElement {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F3F4F6]">
      {/* Section 1 — Hero */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wider text-slate-600">
            About Us
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Born from the frustration of{" "}
            <span className="text-[#1E5F74]">tutorial hell</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            PIVOT AI transforms career confusion into a clear, personalized
            roadmap to your first tech job. No more guessing what to learn next.
          </p>
        </div>
      </section>

      {/* Section 2 — Origin Story */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#1E5F74]" />
                <h2 className="text-sm font-medium uppercase tracking-wider text-[#1E5F74]">
                  The Origin Story
                </h2>
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-slate-900">
                A real problem, not just an academic project
              </h3>
              <p className="text-slate-600 leading-relaxed">
                PIVOT AI started as a Final Master&apos;s Project (TFM), but it
                was born from something deeper: the real frustration of trying
                to navigate a career transition in tech.
              </p>
              <p className="text-slate-600 leading-relaxed">
                The barrier to entry into tech isn&apos;t access to information
                &mdash; YouTube tutorials and free documentation are everywhere.
                The real problem is <strong>information overload</strong>:
                thousands of courses with no clear guidance, months wasted on
                obsolete technologies, and the paralyzing feeling of not knowing
                where to start.
              </p>
              <p className="text-slate-600 leading-relaxed">
                We call it <strong>&quot;tutorial hell&quot;</strong> &mdash;
                watching endless videos without building real skills, hopping
                from one framework to the next, never feeling ready. PIVOT was
                built to fix that.
              </p>
            </div>

            {/* Problem Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: "overload",
                  title: "Information Overload",
                  description:
                    "Thousands of courses and tutorials with no clear guidance on what matters.",
                },
                {
                  icon: "time",
                  title: "Wasted Time",
                  description:
                    "Months spent learning obsolete technologies or irrelevant topics.",
                },
                {
                  icon: "loop",
                  title: "Tutorial Hell",
                  description:
                    "Watching endless videos without building real, marketable skills.",
                },
                {
                  icon: "direction",
                  title: "No Direction",
                  description:
                    "Not knowing what to learn first, what's outdated, or what's relevant to your goal.",
                },
              ].map((problem) => (
                <div
                  key={problem.title}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                    <span className="text-lg">
                      {problem.icon === "overload" && "🤯"}
                      {problem.icon === "time" && "⏳"}
                      {problem.icon === "loop" && "🔄"}
                      {problem.icon === "direction" && "❓"}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    {problem.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500">
                    {problem.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Mission / Solution */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Target className="h-5 w-5 text-[#1E5F74]" />
              <h2 className="text-sm font-medium uppercase tracking-wider text-[#1E5F74]">
                Our Mission
              </h2>
            </div>
            <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              Your personal AI architect and curator
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Instead of giving you generic learning paths, PIVOT analyzes your
              background, understands your goals, and generates a tailor-made
              roadmap with curated resources.
            </p>
          </div>

          {/* How It Works Steps */}
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: GraduationCap,
                title: "Analyzes Your Background",
                description:
                  "Whether you're from tech or a completely different field, PIVOT understands your transferable skills and starting point.",
              },
              {
                icon: Lightbulb,
                title: "Understands Your Goals",
                description:
                  "Frontend, backend, data science, DevOps — tell PIVOT where you want to go, and it maps the shortest path there.",
              },
              {
                icon: Sparkles,
                title: "Generates Your Roadmap",
                description:
                  "A personalized, sequential learning path with curated resources, quizzes, and hands-on projects.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="rounded-xl border border-slate-100 p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1E5F74]/10">
                  <step.icon className="h-6 w-6 text-[#1E5F74]" />
                </div>
                <h4 className="text-base font-semibold text-slate-900">
                  {step.title}
                </h4>
                <p className="mt-2 text-sm text-slate-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Differentiators */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                vs: "vs. Paid Bootcamps",
                problem: "High cost, fixed curriculum, one-size-fits-all",
                solution:
                  "Freemium model, personalized curriculum, learns with you",
              },
              {
                vs: "vs. Course Platforms",
                problem:
                  "Recommendations based on engagement and sales metrics",
                solution:
                  "Algorithmic curation based on learning outcomes and job relevance",
              },
              {
                vs: "vs. Static Roadmaps",
                problem: "Generic, overwhelming, no personalization",
                solution:
                  "Dynamic, contextual, adapts to your unique background",
              },
              {
                vs: "vs. AI Chatbots",
                problem:
                  "No structure, no tracking, no validation, inconsistent advice",
                solution:
                  "Structured roadmaps, progress tracking, AI validation",
              },
            ].map((diff) => (
              <div
                key={diff.vs}
                className="rounded-xl border border-slate-200 bg-slate-50 p-5"
              >
                <h4 className="text-sm font-bold text-[#1D2D50]">{diff.vs}</h4>
                <p className="mt-2 text-xs text-red-500/80 line-through">
                  {diff.problem}
                </p>
                <div className="mt-2 flex items-start gap-1.5">
                  <TrendingUp className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                  <p className="text-xs font-medium text-emerald-700">
                    {diff.solution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Creator */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#1E5F74]">
              The Creator
            </h2>
            <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              Built with care by
            </h3>
            <div className="mt-8">
              <CreatorCard />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
