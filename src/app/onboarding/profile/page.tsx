import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileForm } from "@interfaces/web/components/profile/ProfileForm";

export const metadata: Metadata = {
  title: "Create Your Profile | PIVOT AI",
  description:
    "Set up your PIVOT AI profile to get started on your learning journey",
};

/**
 * Onboarding Profile Page
 *
 * Server component that renders the profile creation form in a centered layout.
 * The form itself is a client component for interactivity.
 */
export default function OnboardingProfilePage(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create your PIVOT Profile
          </CardTitle>
          <CardDescription>
            Enter your details to get started with your personalized learning
            journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
