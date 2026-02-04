"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/infrastructure/auth/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github, Chrome, Mail, Loader2 } from "lucide-react";

type MessageType = "error" | "success";

/**
 * Login Page - Full Authentication UI
 *
 * Supports multiple authentication methods:
 * - OAuth (GitHub, Google)
 * - Email/Password (Login)
 * - Email/Password (Sign Up with email confirmation)
 *
 * After successful authentication, users are redirected to /onboarding/profile
 */
export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: MessageType;
  } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * Initiates OAuth login flow with the specified provider
   *
   * @param provider - The OAuth provider ('github' or 'google')
   */
  const handleOAuth = async (provider: "github" | "google"): Promise<void> => {
    try {
      setIsLoading(true);
      setMessage(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/onboarding/profile`,
        },
      });

      if (error) {
        setMessage({
          text: `Error signing in with ${provider}: ${error.message}`,
          type: "error",
        });
      }
    } catch {
      setMessage({
        text: "Unexpected error during OAuth",
        type: "error",
      });
    } finally {
      // Keep loading state during OAuth redirect
      // Will reset when page reloads
    }
  };

  /**
   * Handles email/password login
   */
  const handleEmailLogin = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({
          text: error.message,
          type: "error",
        });
        return;
      }

      if (data.session) {
        // Login successful - redirect to onboarding
        router.push("/onboarding/profile");
      }
    } catch {
      setMessage({
        text: "An unexpected error occurred",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles new user sign up with email confirmation
   */
  const handleSignUp = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding/profile`,
        },
      });

      if (error) {
        setMessage({
          text: error.message,
          type: "error",
        });
        return;
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        setMessage({
          text: "Check your email to confirm your account",
          type: "success",
        });
        // Clear form
        setEmail("");
        setPassword("");
      } else if (data.session) {
        // Auto sign-in after signup (if email confirmation disabled)
        router.push("/onboarding/profile");
      }
    } catch {
      setMessage({
        text: "An unexpected error occurred",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Welcome to Pivot
          </CardTitle>
          <CardDescription className="text-base">
            Sign in or create your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* OAuth Section */}
          <div className="grid gap-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-3"
              onClick={() => handleOAuth("github")}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Github className="h-5 w-5" />
              )}
              Continue with GitHub
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full gap-3"
              onClick={() => handleOAuth("google")}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Chrome className="h-5 w-5" />
              )}
              Continue with Google
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Email/Password Tabs */}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          {/* Message Display */}
          {message && (
            <div
              className={`w-full rounded-md border p-3 text-sm ${
                message.type === "error"
                  ? "border-red-500 bg-red-50 text-red-900"
                  : "border-green-500 bg-green-50 text-green-900"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Legal Footer */}
          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="/terms" className="underline hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
