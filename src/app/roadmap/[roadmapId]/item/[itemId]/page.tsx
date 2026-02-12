import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "@interfaces/web/components/learning/VideoPlayer";
import { ResourceList } from "@interfaces/web/components/learning/ResourceList";
import { ItemActions } from "@interfaces/web/components/learning/ItemActions";
import { KnowledgeCheck } from "@interfaces/web/components/learning/KnowledgeCheck";
import { ProjectSubmissionForm } from "@interfaces/web/components/learning/ProjectSubmissionForm";
import { getRoadmapItemAction } from "@interfaces/web/actions/learningActions";
import {
  ArrowLeft,
  ClipboardList,
  CheckCircle2,
  ListChecks,
  Layers,
  Send,
} from "lucide-react";

interface ClassroomPageProps {
  params: Promise<{ roadmapId: string; itemId: string }>;
}

function getProjectEstimatedTime(difficulty: string): string {
  switch (difficulty) {
    case "beginner":
      return "4 Hours";
    case "intermediate":
      return "8 Hours";
    case "advanced":
      return "12 Hours";
    default:
      return "6 Hours";
  }
}

/**
 * Learning Classroom Page (Server Component)
 *
 * Theory items: Full-width video + content/resources side-by-side + Knowledge Check
 * Project items: Objective + Acceptance Criteria + Tech Stack + Submit form
 */
export default async function ClassroomPage({
  params,
}: ClassroomPageProps): Promise<React.ReactElement> {
  const { roadmapId, itemId } = await params;
  const result = await getRoadmapItemAction(roadmapId, itemId);

  if (!result.success || !result.data) {
    notFound();
  }

  const { detail, resources } = result.data;
  const { item, roadmapTitle, totalItems } = detail;

  // Pick the first video resource for the main player
  const primaryVideo = resources.find((r) => r.type === "video");

  // Filter out the displayed video from Related Sources
  const sidebarResources = primaryVideo
    ? resources.filter((r) => r.url !== primaryVideo.url)
    : resources;

  // Project items: Redesigned layout matching design system
  if (item.type === "project") {
    // --- MOCK DATA (not yet in database — will come from AI generation in the future) ---
    const mockAcceptanceCriteria = [
      "Successfully decompose the 'User Analytics' module into a standalone microservice",
      "Implement a Redis caching layer to reduce database load by at least 40%",
      "Create a shared UI component library using Tailwind CSS and Storybook",
      "Set up a CI/CD pipeline script using GitHub Actions for automated deployment tests",
    ];
    const mockTechnicalStack = [
      "React 18",
      "Node.js",
      "PostgreSQL",
      "Redis",
      "Docker",
      "Tailwind CSS",
    ];
    // --- END MOCK DATA ---

    return (
      <div className="container mx-auto p-6 md:p-8 max-w-6xl">
        {/* Back to roadmap — same as theory */}
        <Link
          href={`/roadmap/${roadmapId}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {roadmapTitle}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            {item.topic ? `${item.topic} / ` : ""}Project
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1D2D50]">
            {item.title}
          </h1>
          <p className="text-sm text-[#1E5F74] mt-1.5 font-medium">
            Difficulty: <span className="capitalize">{item.difficulty}</span> •
            Est. Time: {getProjectEstimatedTime(item.difficulty)}
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left column — Main content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Project Objective */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                  <ClipboardList className="h-4 w-4 text-slate-600" />
                </div>
                <h2 className="text-lg font-bold text-[#1D2D50]">
                  Project Objective
                </h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </section>

            {/* Acceptance Criteria (MOCK) */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                  <ListChecks className="h-4 w-4 text-slate-600" />
                </div>
                <h2 className="text-lg font-bold text-[#1D2D50]">
                  Acceptance Criteria
                </h2>
              </div>
              <ul className="space-y-2.5">
                {mockAcceptanceCriteria.map((criteria, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1E5F74] mt-0.5" />
                    <span className="text-sm text-slate-600">{criteria}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Technical Stack (MOCK) */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                  <Layers className="h-4 w-4 text-slate-600" />
                </div>
                <h2 className="text-lg font-bold text-[#1D2D50]">
                  Technical Stack
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {mockTechnicalStack.map((tech) => (
                  <Badge
                    key={tech}
                    variant="outline"
                    className="border-slate-300 bg-white px-3 py-1 text-xs text-slate-700"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </section>
          </div>

          {/* Right column — Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Evaluation Criteria — Dark card */}
            <div className="rounded-xl bg-[#1D2D50] p-5 space-y-5">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  How We Evaluate
                </h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#FCDAB7] mt-0.5 shrink-0" />
                    <span className="text-sm text-white">
                      Relevance to the module topic{" "}
                      <span className="text-slate-400">(40%)</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#FCDAB7] mt-0.5 shrink-0" />
                    <span className="text-sm text-white">
                      Code quality &amp; organization{" "}
                      <span className="text-slate-400">(25%)</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#FCDAB7] mt-0.5 shrink-0" />
                    <span className="text-sm text-white">
                      Best practices &amp; patterns{" "}
                      <span className="text-slate-400">(20%)</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#FCDAB7] mt-0.5 shrink-0" />
                    <span className="text-sm text-white">
                      Documentation &amp; README{" "}
                      <span className="text-slate-400">(10%)</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#FCDAB7] mt-0.5 shrink-0" />
                    <span className="text-sm text-white">
                      Functionality &amp; completeness{" "}
                      <span className="text-slate-400">(5%)</span>
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Requirements
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-[#FCDAB7] font-bold mt-px">•</span>
                    Repository must be{" "}
                    <span className="text-white font-medium">public</span> on
                    GitHub
                  </li>
                  <li className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-[#FCDAB7] font-bold mt-px">•</span>
                    Must match the module&apos;s technology and purpose
                  </li>
                  <li className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-[#FCDAB7] font-bold mt-px">•</span>
                    Score of <span className="text-white font-medium">
                      70+
                    </span>{" "}
                    required to pass
                  </li>
                </ul>
              </div>
            </div>

            {/* Submit Your Work */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-[#1D2D50]" />
                <h3 className="text-base font-semibold text-[#1D2D50]">
                  Submit Your Work
                </h3>
              </div>
              <ProjectSubmissionForm
                roadmapId={roadmapId}
                roadmapItemId={item.id}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Theory items: New redesigned layout
  return (
    <div className="container mx-auto p-6 md:p-8 max-w-5xl">
      {/* Back to roadmap */}
      <Link
        href={`/roadmap/${roadmapId}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {roadmapTitle}
      </Link>

      {/* Full-width Video Player with breadcrumb */}
      {primaryVideo ? (
        <VideoPlayer
          videoUrl={primaryVideo.url}
          title={primaryVideo.title}
          breadcrumb={{
            trackName: roadmapTitle,
            moduleName: item.title,
          }}
        />
      ) : (
        <VideoPlayer
          videoUrl=""
          title={item.title}
          breadcrumb={{
            trackName: roadmapTitle,
            moduleName: item.title,
          }}
        />
      )}

      {/* Content Section: Description + Related Sources */}
      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        {/* Left Column - Module Info */}
        <div className="lg:col-span-3 space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1D2D50]">
            {item.title}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {item.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {item.topic && (
              <Badge className="bg-[#1D2D50] text-white hover:bg-[#152340] text-xs">
                {item.topic}
              </Badge>
            )}
            <Badge className="bg-[#1E5F74] text-white hover:bg-[#1E5F74]/90 text-xs">
              {item.difficulty}
            </Badge>
            <Badge className="bg-[#133B5C] text-white hover:bg-[#133B5C]/90 text-xs">
              Step {item.order} of {totalItems}
            </Badge>
          </div>
        </div>

        {/* Right Column - Related Sources */}
        <div className="lg:col-span-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Related Sources
          </h3>
          <ResourceList resources={sidebarResources} />
        </div>
      </div>

      {/* Knowledge Check */}
      <div className="mt-12">
        <KnowledgeCheck roadmapId={roadmapId} itemId={itemId} />
      </div>

      {/* Mark Complete action */}
      <div className="mt-8 flex justify-center">
        <div className="w-full max-w-md">
          <ItemActions
            itemId={item.id}
            roadmapId={roadmapId}
            initialStatus={item.status}
          />
        </div>
      </div>
    </div>
  );
}
