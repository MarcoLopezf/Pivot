import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoPlayer } from "@interfaces/web/components/learning/VideoPlayer";
import { ResourceList } from "@interfaces/web/components/learning/ResourceList";
import { ItemActions } from "@interfaces/web/components/learning/ItemActions";
import { getRoadmapItemAction } from "@interfaces/web/actions/learningActions";
import { ArrowLeft, BookOpen, Code } from "lucide-react";

interface ClassroomPageProps {
  params: Promise<{ roadmapId: string; itemId: string }>;
}

/**
 * Learning Classroom Page (Server Component)
 *
 * Distraction-free learning environment where users:
 * - Watch embedded video content
 * - Browse additional resources
 * - Mark items as complete
 * - Take quizzes to validate learning
 *
 * Layout:
 * - Breadcrumb navigation back to roadmap
 * - Main stage: VideoPlayer (left / top on mobile)
 * - Sidebar: Item info, ItemActions, ResourceList (right / bottom on mobile)
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

  return (
    <div className="container mx-auto p-6 md:p-8 max-w-6xl">
      {/* Breadcrumb Navigation */}
      <Link
        href={`/roadmap/${roadmapId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {roadmapTitle}
      </Link>

      {/* Item Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            Step {item.order} of {totalItems}
          </Badge>
          <Badge
            variant="secondary"
            className={
              item.type === "theory"
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700"
            }
          >
            {item.type === "theory" ? (
              <BookOpen className="h-3 w-3 mr-1" />
            ) : (
              <Code className="h-3 w-3 mr-1" />
            )}
            {item.type === "theory" ? "Theory" : "Project"}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {item.difficulty}
          </Badge>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">{item.title}</h1>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Stage */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          {primaryVideo ? (
            <VideoPlayer
              videoUrl={primaryVideo.url}
              title={primaryVideo.title}
            />
          ) : (
            <VideoPlayer videoUrl="" title={item.title} />
          )}

          {/* Description Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About this module</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
              {item.topic && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Topic:</span>
                  <Badge variant="outline" className="text-xs">
                    {item.topic}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemActions
                itemId={item.id}
                roadmapId={roadmapId}
                initialStatus={item.status}
                itemType={item.type}
              />
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Resources
                {resources.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {resources.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResourceList resources={resources} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
