"use client";

import { useState, useMemo, useEffect, FormEvent } from "react";
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
import { Loader2, KeyRound, Check, X, CheckCircle } from "lucide-react";

type MessageType = "error" | "success";

/**
 * UpdatePasswordPage - Client Component
 *
 * Allows authenticated users to set a new password after clicking
 * a password reset link. Requires an active session (set by /auth/callback).
 *
 * The middleware protects this route, redirecting unauthenticated users to /login.
 *
 * @layer Interface (Web)
 */
export default function UpdatePasswordPage(): React.ReactElement {
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updated, setUpdated] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: MessageType;
  } | null>(null);

  // Redirect to login if session is gone (e.g. link already used)
  useEffect(() => {
    const checkSession = async (): Promise<void> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
      }
    };

    void checkSession();
  }, [supabase]);

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
    return passwordRules.filter((rule) => rule.test(password)).length;
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

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const failedRules = passwordRules.filter((rule) => !rule.test(password));
    if (failedRules.length > 0) {
      setMessage({
        text: `Password requires: ${failedRules.map((r) => r.label).join(", ")}`,
        type: "error",
      });
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage({
        text: "Passwords do not match",
        type: "error",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setMessage({
          text: error.message,
          type: "error",
        });
        return;
      }

      setUpdated(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
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
            Set new password
          </CardTitle>
          <CardDescription className="text-base text-slate-300">
            {updated
              ? "Password updated — redirecting..."
              : "Choose a strong password for your account"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {updated ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CheckCircle className="h-14 w-14 text-green-400" />
              <p className="text-sm text-slate-300">
                Your password has been updated successfully.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="new-password" className="text-slate-300">
                  New password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="bg-[#EAF0FD] border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#1E5F74] focus-visible:border-[#1E5F74] autofill:shadow-[inset_0_0_0px_1000px_#EAF0FD]"
                />

                {password.length > 0 && (
                  <div className="space-y-2">
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
                <Label htmlFor="confirm-password" className="text-slate-300">
                  Confirm new password
                </Label>
                <Input
                  id="confirm-password"
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
                    Updating...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    Update password
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter>
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
        </CardFooter>
      </Card>
    </div>
  );
}
