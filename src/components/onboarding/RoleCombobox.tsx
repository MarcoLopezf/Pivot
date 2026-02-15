"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getJobRolesAction } from "@/interfaces/web/actions/learningActions";
import type { JobRoleDTO } from "@/application/dtos/learning/JobRoleDTO";

export interface RoleComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * RoleCombobox Component
 *
 * A searchable combobox for selecting job roles from curated database.
 * **Strict Mode Only** - User must select from the list.
 *
 * Features:
 * - Fetches curated tech roles from database
 * - Search/filter functionality
 * - Ensures high-quality data for AI roadmap generation
 * - Integrates with React Hook Form via FormControl
 *
 * Usage: Target Role selection (Step 4)
 *
 * @layer Interface (Web)
 */
export function RoleCombobox({
  value,
  onChange,
  placeholder = "Select a tech role...",
  disabled = false,
}: RoleComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [roles, setRoles] = React.useState<JobRoleDTO[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch roles on mount
  React.useEffect(() => {
    const fetchRoles = async (): Promise<void> => {
      try {
        const result = await getJobRolesAction();
        if (result.success && result.data) {
          setRoles(result.data);
        } else {
          console.error("Failed to fetch job roles:", result.error);
        }
      } catch (error) {
        console.error("Error fetching job roles:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchRoles();
  }, []);

  // Display value
  const displayValue = React.useMemo(() => {
    if (!value) return placeholder;
    return value;
  }, [value, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || loading}
          className={cn(
            "w-full justify-between bg-white border-slate-300 text-slate-900 hover:bg-slate-50 hover:border-slate-400",
            !value && "text-slate-500",
          )}
        >
          <span className="truncate">
            {loading ? "Loading roles..." : displayValue}
          </span>
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border-slate-300">
        <Command className="bg-white">
          <CommandInput
            placeholder="Search tech roles..."
            className="border-slate-200"
          />
          <CommandList>
            <CommandEmpty>
              <p className="py-6 text-center text-sm text-slate-500">
                No role found. Try a different search.
              </p>
            </CommandEmpty>
            <CommandGroup>
              {roles.map((role) => (
                <CommandItem
                  key={role.id}
                  value={role.name}
                  onSelect={() => {
                    onChange(role.name);
                    setOpen(false);
                  }}
                  className="cursor-pointer aria-selected:bg-slate-100 aria-selected:!text-black"
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4 text-[#1E5F74]",
                      value === role.name ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex-1 !text-black">{role.name}</span>
                  {role.category && (
                    <span className="ml-2 text-xs !text-slate-700">
                      {role.category}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
