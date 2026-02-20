"use client";

import { useState, useMemo, FormEvent } from "react";
import Link from "next/link";
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
import { Github, Chrome, Mail, Loader2, Check, X } from "lucide-react";

type MessageType = "error" | "success";

/**
 * Login Page - Full Authentication UI
 *
 * Supports multiple authentication methods:
 * - OAuth (GitHub, Google)
 * - Email/Password (Login)
 * - Email/Password (Sign Up with email confirmation)
 *
 * After successful authentication, users are redirected to /
 * The root page handles smart routing (has roadmap → roadmap, no roadmap → onboarding)
 */
export default function LoginPage() {
  const supabase = createClient();

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: MessageType;
  } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  /**
   * Password validation rules
   */
  const passwordRules = useMemo(
    () => [
      {
        label: "At least 8 characters",
        test: (pw: string): boolean => pw.length >= 8,
      },
      {
        label: "One uppercase letter (A-Z)",
        test: (pw: string): boolean => /[A-Z]/.test(pw),
      },
      {
        label: "One lowercase letter (a-z)",
        test: (pw: string): boolean => /[a-z]/.test(pw),
      },
      {
        label: "One number (0-9)",
        test: (pw: string): boolean => /[0-9]/.test(pw),
      },
    ],
    [],
  );

  const passwordStrength = useMemo(() => {
    const passed = passwordRules.filter((rule) => rule.test(password)).length;
    return passed;
  }, [password, passwordRules]);

  const strengthLabel = useMemo((): string => {
    if (password.length === 0) return "";
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    return "Strong";
  }, [password, passwordStrength]);

  const strengthColor = useMemo((): string => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-orange-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    return "bg-green-500";
  }, [passwordStrength]);

  /**
   * Validates email format using regex
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Clears form fields when switching tabs
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleTabChange = (_value: string): void => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setMessage(null);
  };

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
          redirectTo: `${window.location.origin}/auth/callback?next=/`,
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

    // Validate email format
    if (!isValidEmail(email)) {
      setMessage({
        text: "Please enter a valid email address",
        type: "error",
      });
      setIsLoading(false);
      return;
    }

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
        // Full page navigation to re-render server components (SiteHeader auth state)
        window.location.href = "/";
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
   * Handles new user sign up
   *
   * TODO [TECHNICAL DEBT]: Implement email verification flow
   * Currently bypassing email confirmation to allow immediate onboarding.
   * Future implementation should:
   * - Send verification email after signup
   * - Show "Check your email" message
   * - Only allow full platform access after email verification
   * - Add email verification status to user profile
   * - Handle resend verification email functionality
   */
  const handleSignUp = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Validate email format
    if (!isValidEmail(email)) {
      setMessage({
        text: "Please enter a valid email address",
        type: "error",
      });
      setIsLoading(false);
      return;
    }

    // Validate full name
    if (fullName.trim().length < 2) {
      setMessage({
        text: "Full name must be at least 2 characters",
        type: "error",
      });
      setIsLoading(false);
      return;
    }

    // Validate password requirements
    const failedRules = passwordRules.filter((rule) => !rule.test(password));
    if (failedRules.length > 0) {
      setMessage({
        text: `Password requires: ${failedRules.map((r) => r.label).join(", ")}`,
        type: "error",
      });
      setIsLoading(false);
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setMessage({
        text: "Passwords do not match",
        type: "error",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
          data: {
            name: fullName.trim(),
          },
        },
      });

      if (error) {
        setMessage({
          text: error.message,
          type: "error",
        });
        return;
      }

      // TEMPORARY: Redirect to onboarding immediately without email verification
      // This allows users to complete onboarding flow without waiting for email confirmation
      // TODO: Re-enable email verification requirement once verification flow is implemented
      if (data.user) {
        setMessage({
          text: "Account created! Redirecting to onboarding...",
          type: "success",
        });
        // Full page navigation to re-render server components (SiteHeader auth state)
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md bg-[#1D2D50] shadow-xl border-none">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-white">
            Welcome to Pivot
          </CardTitle>
          <CardDescription className="text-base text-slate-300">
            Sign in or create your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* OAuth Section */}
          <div className="grid gap-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-3 border-slate-600 bg-transparent text-white hover:bg-[#133B5C] hover:border-slate-500 transition-colors"
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
              className="w-full gap-3 border-slate-600 bg-transparent text-white hover:bg-[#133B5C] hover:border-slate-500 transition-colors"
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
              <span className="w-full border-t border-slate-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1D2D50] px-2 text-slate-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Email/Password Tabs */}
          <Tabs
            defaultValue="login"
            className="w-full"
            onValueChange={handleTabChange}
          >
            <TabsList
              variant="line"
              className="grid w-full grid-cols-2 rounded-none h-auto p-0 border-b border-slate-600"
            >
              <TabsTrigger
                value="login"
                className="rounded-none text-slate-400 data-[state=active]:text-white data-[state=active]:font-semibold py-2.5 after:bg-[#FCDAB7] after:h-[2px]"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-none text-slate-400 data-[state=active]:text-white data-[state=active]:font-semibold py-2.5 after:bg-[#FCDAB7] after:h-[2px]"
              >
                Register
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="login-email" className="text-slate-300">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-[#EAF0FD] border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#1E5F74] focus-visible:border-[#1E5F74] autofill:shadow-[inset_0_0_0px_1000px_#EAF0FD]"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-slate-300">
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-[#EAF0FD] border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#1E5F74] focus-visible:border-[#1E5F74] autofill:shadow-[inset_0_0_0px_1000px_#EAF0FD]"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gap-2 bg-[#FCDAB7] hover:bg-[#f5c9a0] text-slate-900 font-medium transition-colors"
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
            <TabsContent value="register" className="space-y-4 mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="register-fullname" className="text-slate-300">
                    Full Name
                  </Label>
                  <Input
                    id="register-fullname"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={100}
                    disabled={isLoading}
                    className="bg-[#EAF0FD] border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#1E5F74] focus-visible:border-[#1E5F74] autofill:shadow-[inset_0_0_0px_1000px_#EAF0FD]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="register-email" className="text-slate-300">
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-[#EAF0FD] border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#1E5F74] focus-visible:border-[#1E5F74] autofill:shadow-[inset_0_0_0px_1000px_#EAF0FD]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="register-password" className="text-slate-300">
                    Password
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isLoading}
                    className="bg-[#EAF0FD] border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#1E5F74] focus-visible:border-[#1E5F74] autofill:shadow-[inset_0_0_0px_1000px_#EAF0FD]"
                  />

                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <div className="space-y-2">
                      {/* Strength Bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                            style={{
                              width: `${(passwordStrength / 4) * 100}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium min-w-[45px] text-right ${
                            passwordStrength <= 1
                              ? "text-red-400"
                              : passwordStrength === 2
                                ? "text-orange-400"
                                : passwordStrength === 3
                                  ? "text-yellow-400"
                                  : "text-green-400"
                          }`}
                        >
                          {strengthLabel}
                        </span>
                      </div>

                      {/* Requirements Checklist */}
                      <ul className="space-y-1">
                        {passwordRules.map((rule) => {
                          const passed = rule.test(password);
                          return (
                            <li
                              key={rule.label}
                              className={`flex items-center gap-1.5 text-xs ${
                                passed ? "text-green-400" : "text-slate-400"
                              }`}
                            >
                              {passed ? (
                                <Check className="h-3 w-3 shrink-0" />
                              ) : (
                                <X className="h-3 w-3 shrink-0" />
                              )}
                              {rule.label}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="register-confirm-password"
                    className="text-slate-300"
                  >
                    Confirm Password
                  </Label>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isLoading}
                    className="bg-[#EAF0FD] border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#1E5F74] focus-visible:border-[#1E5F74] autofill:shadow-[inset_0_0_0px_1000px_#EAF0FD]"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gap-2 bg-[#FCDAB7] hover:bg-[#f5c9a0] text-slate-900 font-medium transition-colors"
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
                  ? "border-red-400 bg-red-950/50 text-red-200"
                  : "border-green-400 bg-green-950/50 text-green-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Legal Footer */}
          <p className="text-center text-xs text-slate-400">
            By continuing, you agree to our{" "}
            <a
              href="/terms"
              className="underline hover:text-slate-200 transition-colors"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="underline hover:text-slate-200 transition-colors"
            >
              Privacy Policy
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
