/**
 * Onboarding Form Components
 *
 * Custom styled form components specifically for the onboarding flow.
 * Wraps shadcn/ui components with forced white backgrounds.
 */

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * OnboardingInput - Input with forced white background
 */
export const OnboardingInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  return (
    <Input
      {...props}
      ref={ref}
      className="!bg-white border-slate-300 focus-visible:ring-0 focus-visible:border-[#1E5F74] text-slate-900 placeholder:text-slate-400"
    />
  );
});
OnboardingInput.displayName = "OnboardingInput";

/**
 * OnboardingTextarea - Textarea with forced white background
 */
export const OnboardingTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <Textarea
      {...props}
      ref={ref}
      className={`!bg-white border-slate-200 focus-visible:ring-0 focus-visible:border-[#1E5F74] text-slate-900 placeholder:text-slate-400 ${className ?? ""}`}
    />
  );
});
OnboardingTextarea.displayName = "OnboardingTextarea";

/**
 * OnboardingSelect - Re-export with custom trigger that forces white background
 */
export { Select as OnboardingSelect };
export { SelectValue as OnboardingSelectValue };
export { SelectContent as OnboardingSelectContent };
export { SelectItem as OnboardingSelectItem };

export const OnboardingSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  React.ComponentPropsWithoutRef<typeof SelectTrigger>
>((props, ref) => {
  return (
    <SelectTrigger
      {...props}
      ref={ref}
      className="!bg-white border-slate-300 focus:ring-[#1E5F74] focus:border-[#1E5F74] w-full h-10 text-slate-900 placeholder:text-slate-400"
    />
  );
});
OnboardingSelectTrigger.displayName = "OnboardingSelectTrigger";

/**
 * OnboardingFileInput - Custom file input with "Choose File" button matching Figma design
 */
interface OnboardingFileInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  onFileChange?: (file: File | null) => void;
  selectedFileName?: string;
}

export const OnboardingFileInput = React.forwardRef<
  HTMLInputElement,
  OnboardingFileInputProps
>(({ onFileChange, selectedFileName, disabled, accept, ...props }, ref) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useImperativeHandle(ref, () => inputRef.current!);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileChange?.(file);
  };

  return (
    <div className="relative">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        className="hidden"
        onChange={handleFileChange}
        {...props}
      />
      {/* Custom styled container matching Figma */}
      <div className="flex h-11 w-full items-center rounded-md border border-slate-300 bg-white px-3 py-2 transition-colors hover:border-slate-400 focus-within:border-[#1E5F74] focus-within:ring-1 focus-within:ring-[#1E5F74]">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="rounded-md bg-[#1D2D50] px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#152340] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Choose File
        </button>
        <span className="ml-3 text-sm text-slate-500">
          {selectedFileName || "No file chosen"}
        </span>
      </div>
    </div>
  );
});
OnboardingFileInput.displayName = "OnboardingFileInput";
