import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * MarketAnalysisSkeleton
 *
 * Loading skeleton that mimics the layout of MarketSalaryCard,
 * MarketDemandCard, and MarketSkillsCard.
 */
export function MarketAnalysisSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Salary Card Skeleton */}
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-5 w-24" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-40" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-4 w-20 mt-2" />
          </div>
          <Skeleton className="h-3 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardContent>
      </Card>

      {/* Demand Card Skeleton */}
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-5 w-28" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-36" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-4 w-24 mt-2" />
          </div>
          <Skeleton className="h-2 w-full" />
          <div className="flex justify-center gap-3">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* Skills Card Skeleton */}
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-5 w-20" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-44" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-22 rounded-full" />
            <Skeleton className="h-8 w-26 rounded-full" />
            <Skeleton className="h-8 w-18 rounded-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
