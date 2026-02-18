"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
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
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { requestPasswordReset } from "@interfaces/web/actions/passwordResetActions";

type MessageType = "error" | "success";

/**
 * ForgotPasswordPage - Client Component
 *
 * Allows users to request a password reset email.
 * On submit, calls the `requestPasswordReset` server action which
 * triggers Supabase Auth to send an email via the configured SMTP provider.
 *
 * @layer Interface (Web)
 */
export default function ForgotPasswordPage(): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: MessageType;
  } | null>(null);

  const isValidEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!isValidEmail(email)) {
      setMessage({
        text: "Please enter a valid email address",
        type: "error",
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await requestPasswordReset(email);

      if (!result.success) {
        setMessage({
          text: result.error ?? "Failed to send reset email",
          type: "error",
        });
        return;
      }

      setSubmitted(true);
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
            Reset your password
          </CardTitle>
          <CardDescription className="text-base text-slate-300">
            {submitted
              ? "Check your inbox for next steps"
              : "Enter your email and we'll send you a reset link"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CheckCircle className="h-14 w-14 text-green-400" />
              <p className="text-sm text-slate-300">
                If an account exists for{" "}
                <span className="font-semibold text-white">{email}</span>, you
                will receive a password reset link shortly.
              </p>
              <p className="text-xs text-slate-400">
                Don&apos;t see it? Check your spam folder.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="reset-email" className="text-slate-300">
                  Email
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Send reset link
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
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

          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
