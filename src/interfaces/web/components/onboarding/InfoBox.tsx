import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

/**
 * InfoBox Component - Reusable Info Box for Onboarding
 *
 * A unified component for displaying informational messages, tips,
 * next steps, confirmations, etc. throughout the onboarding flow.
 *
 * Features:
 * - Cream/beige background (#FFF5E5) for default info boxes
 * - Teal/green background (#E6F4F7) for success messages
 * - Optional icon (configurable via lucide-react)
 * - Title + description/children support
 * - Consistent styling across all onboarding steps
 *
 * @layer Interface (Web)
 */

export interface InfoBoxProps {
  /**
   * Optional variant for special styling
   * - undefined/default: Cream background (info/tips)
   * - "success": Teal background (success confirmations)
   */
  variant?: "success";

  /**
   * Optional icon component from lucide-react
   * If not provided, no icon will be shown
   */
  icon?: LucideIcon;

  /**
   * Title/heading of the info box
   */
  title?: string;

  /**
   * Description text or children content
   * Can be a string or JSX for complex content
   */
  children: ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export function InfoBox({
  variant,
  icon: Icon,
  title,
  children,
  className = "",
}: InfoBoxProps) {
  // Determine styles based on variant
  const isSuccess = variant === "success";

  const containerClasses = isSuccess
    ? "bg-[#E6F4F7] border-[#1E5F74]/20"
    : "bg-[#FFF5E5] border-slate-200";

  const iconBgClasses = isSuccess ? "bg-[#1E5F74]" : "bg-slate-100";

  const iconColorClasses = isSuccess ? "text-white" : "text-slate-600";

  const titleColorClasses = isSuccess ? "text-[#133B5C]" : "text-slate-900";

  const textColorClasses = isSuccess ? "text-[#133B5C]" : "text-slate-700";

  return (
    <div
      className={`rounded-lg border p-4 ${containerClasses} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Icon (optional) */}
        {Icon && (
          <div className="flex-shrink-0">
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full ${iconBgClasses}`}
            >
              <Icon className={`h-3.5 w-3.5 ${iconColorClasses}`} />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold ${titleColorClasses} mb-2`}>
              {title}
            </h4>
          )}
          <div className={`text-sm ${textColorClasses}`}>{children}</div>
        </div>
      </div>
    </div>
  );
}
