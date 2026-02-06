import { LearningResource } from "@domain/learning/repositories/IResourceRepository";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  PlayCircle,
  BookOpen,
  GraduationCap,
} from "lucide-react";

interface ResourceListProps {
  resources: LearningResource[];
}

function getResourceIcon(type: LearningResource["type"]): React.ReactElement {
  switch (type) {
    case "video":
      return <PlayCircle className="h-4 w-4 text-red-500" />;
    case "article":
      return <BookOpen className="h-4 w-4 text-blue-500" />;
    case "course":
      return <GraduationCap className="h-4 w-4 text-purple-500" />;
  }
}

function getTypeBadgeColor(type: LearningResource["type"]): string {
  switch (type) {
    case "video":
      return "bg-red-100 text-red-700";
    case "article":
      return "bg-blue-100 text-blue-700";
    case "course":
      return "bg-purple-100 text-purple-700";
  }
}

/**
 * ResourceList Component
 *
 * Displays a clean list of learning resources with type icons,
 * channel/source info, and external links.
 */
export function ResourceList({
  resources,
}: ResourceListProps): React.ReactElement {
  if (resources.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        <BookOpen className="h-10 w-10 mx-auto mb-2" />
        <p className="text-sm">No additional resources available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {resources.map((resource, index) => (
        <a
          key={resource.id || `resource-${index}`}
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="flex-shrink-0">
                {getResourceIcon(resource.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:underline">
                  {resource.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground truncate">
                    {resource.channelName}
                  </span>
                  {resource.duration && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {resource.duration}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`text-[10px] ${getTypeBadgeColor(resource.type)}`}
                >
                  {resource.type}
                </Badge>
                <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  );
}
