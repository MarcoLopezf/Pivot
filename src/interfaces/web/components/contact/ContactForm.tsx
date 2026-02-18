"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitContactAction } from "@interfaces/web/actions/contactActions";
import { InquiryType } from "@domain/contact/InquiryType";

const INQUIRY_OPTIONS: { value: InquiryType; label: string }[] = [
  { value: InquiryType.FEEDBACK, label: "Feedback" },
  { value: InquiryType.BUG_REPORT, label: "Bug Report" },
  { value: InquiryType.FEATURE_REQUEST, label: "Feature Request" },
  { value: InquiryType.SUGGESTION, label: "Suggestion" },
  { value: InquiryType.GENERAL_INQUIRY, label: "General Inquiry" },
];

/**
 * ContactForm - Client Component
 *
 * Form with client-side validation for submitting contact messages.
 * Shows success state after submission.
 *
 * @layer Interface (Web)
 */
export function ContactForm(): React.ReactElement {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryType, setInquiryType] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  function validate(): string | null {
    const trimmedName = fullName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return "Name must be between 2 and 100 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address";
    }

    if (!inquiryType) {
      return "Please select an inquiry type";
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 10 || trimmedMessage.length > 5000) {
      return "Message must be between 10 and 5000 characters";
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const result = await submitContactAction(
        fullName,
        email,
        inquiryType,
        message,
      );

      if (result.success) {
        setIsSuccess(true);
      } else {
        setError(result.error ?? "Something went wrong");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset(): void {
    setFullName("");
    setEmail("");
    setInquiryType("");
    setMessage("");
    setError("");
    setIsSuccess(false);
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-slate-900">
          Message Sent
        </h3>
        <p className="mb-6 text-sm text-slate-600">
          Thank you for reaching out. We&apos;ll get back to you as soon as
          possible.
        </p>
        <Button
          variant="outline"
          onClick={handleReset}
          className="border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          placeholder="Your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          maxLength={100}
          disabled={isLoading}
          className="!bg-white border-slate-300 focus-visible:ring-0 focus-visible:border-[#1E5F74] text-slate-900 placeholder:text-slate-400"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="!bg-white border-slate-300 focus-visible:ring-0 focus-visible:border-[#1E5F74] text-slate-900 placeholder:text-slate-400"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="inquiryType">Inquiry Type</Label>
        <Select
          value={inquiryType}
          onValueChange={setInquiryType}
          disabled={isLoading}
        >
          <SelectTrigger
            id="inquiryType"
            disabled={isLoading}
            className="!bg-white border-slate-300 focus:ring-0 focus:border-[#1E5F74] text-slate-900"
          >
            <SelectValue placeholder="Select a topic" />
          </SelectTrigger>
          <SelectContent position="popper" className="bg-white text-slate-900">
            {INQUIRY_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="focus:bg-slate-100 focus:text-slate-900 data-[state=checked]:bg-slate-100 data-[state=checked]:text-slate-900"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Tell us what's on your mind..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          maxLength={5000}
          disabled={isLoading}
          className="!bg-white border-slate-300 focus-visible:ring-0 focus-visible:border-[#1E5F74] text-slate-900 placeholder:text-slate-400"
        />
        <p className="text-xs text-slate-500">
          {message.length}/5000 characters
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#1D2D50] text-white hover:bg-[#152340] transition-colors"
      >
        {isLoading ? (
          "Sending..."
        ) : (
          <>
            Send Message
            <Send className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
