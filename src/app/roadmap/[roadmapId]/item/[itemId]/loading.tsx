import { LessonSkeleton } from "@interfaces/web/components/skeletons/LessonSkeleton";

export default function LessonLoading(): React.ReactElement {
  return (
    <div className="container mx-auto p-6 md:p-8 max-w-6xl">
      <LessonSkeleton />
    </div>
  );
}
