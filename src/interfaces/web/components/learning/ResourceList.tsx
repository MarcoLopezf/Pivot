import { LearningResource } from "@domain/learning/repositories/IResourceRepository";
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
  const iconClasses = "h-5 w-5 text-white";
  switch (type) {
    case "video":
      return <PlayCircle className={iconClasses} />;
    case "article":
      return <BookOpen className={iconClasses} />;
    case "course":
      return <GraduationCap className={iconClasses} />;
  }
}

function getResourceColor(type: LearningResource["type"]): string {
  switch (type) {
    case "video":
      return "bg-[#1D2D50]";
    case "article":
      return "bg-[#1E5F74]";
    case "course":
      return "bg-[#133B5C]";
  }
}

/**
 * ResourceList Component
 *
 * Displays learning resources as horizontal cards with circular icon,
 * title and subtitle. Styled as "Related Sources" section.
 */
export function ResourceList({
  resources,
}: ResourceListProps): React.ReactElement {
  if (resources.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400">
        <BookOpen className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm">No additional resources available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {resources.map((resource, index) => (
        <a
          key={resource.id || `resource-${index}`}
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all group"
        >
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full ${getResourceColor(resource.type)} flex items-center justify-center`}
          >
            {getResourceIcon(resource.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-[#1E5F74] transition-colors">
              {resource.title}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {resource.channelName}
              {resource.duration && ` \u00B7 ${resource.duration}`}
            </p>
          </div>
          <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors" />
        </a>
      ))}
    </div>
  );
}
