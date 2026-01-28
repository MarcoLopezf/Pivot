import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard | PIVOT AI",
  description: "Your PIVOT AI learning dashboard",
};

/**
 * Dashboard Page (Placeholder)
 *
 * Temporary placeholder page for the redirect after profile creation.
 * Will be replaced with actual dashboard functionality in future iterations.
 */
export default function DashboardPage(): React.ReactElement {
  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Welcome to PIVOT AI Dashboard
          </CardTitle>
          <CardDescription>
            Your profile has been created successfully!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is a placeholder dashboard page. In future iterations, this
            will display your learning roadmaps, progress, and recommendations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
