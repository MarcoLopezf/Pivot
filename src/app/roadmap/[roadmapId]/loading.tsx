import { RoadmapSkeleton } from "@interfaces/web/components/skeletons/RoadmapSkeleton";

export default function RoadmapLoading(): React.ReactElement {
  return (
    <div className="container mx-auto p-6 md:p-8 max-w-6xl">
      <RoadmapSkeleton />
    </div>
  );
}
