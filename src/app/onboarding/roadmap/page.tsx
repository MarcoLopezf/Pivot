import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Your Learning Roadmap | PIVOT AI",
  description: "Your personalized learning roadmap",
};

/**
 * Onboarding Roadmap Page (Placeholder)
 *
 * Temporary placeholder page for the redirect after career goal creation.
 * Will be replaced with actual roadmap generation functionality in future iterations.
 */
export default function OnboardingRoadmapPage(): React.ReactElement {
  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Your Learning Roadmap
          </CardTitle>
          <CardDescription>Career goal saved successfully!</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is a placeholder roadmap page. In future iterations, this will
            display your AI-generated learning roadmap with milestones, skills
            to learn, and recommended resources.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
