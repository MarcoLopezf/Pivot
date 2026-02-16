"use client";

/**
 * OnboardingCountryCombobox - Searchable country selector for onboarding
 *
 * Uses country-region-data for a complete list of ~250 countries
 * and shadcn Popover + Command (cmdk) for a searchable dropdown.
 * Styled to match the onboarding form design system.
 *
 * @layer Interface (Web)
 */

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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
import allCountries from "country-region-data/data.json";

interface CountryOption {
  label: string;
  value: string;
}

/** Pre-computed country options sorted alphabetically */
const countryOptions: CountryOption[] = allCountries
  .map((country) => ({
    label: country.countryName,
    value: country.countryShortCode,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

interface OnboardingCountryComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function OnboardingCountryCombobox({
  value,
  onValueChange,
  disabled = false,
  placeholder = "Select your country...",
}: OnboardingCountryComboboxProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);

  const selectedCountry = countryOptions.find(
    (country) => country.value === value,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between !bg-white border-slate-300 hover:!bg-slate-50 focus:ring-[#1E5F74] focus:border-[#1E5F74] !text-slate-900 hover:!text-slate-900 font-normal h-10"
        >
          {selectedCountry ? (
            <span className="truncate">{selectedCountry.label}</span>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 !bg-white border-slate-300 shadow-lg"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command className="!bg-white">
          <CommandInput
            placeholder="Search country..."
            className="!text-slate-900 placeholder:!text-slate-400"
          />
          <CommandList className="!bg-white">
            <CommandEmpty className="!text-slate-500">
              No country found.
            </CommandEmpty>
            <CommandGroup className="!bg-white">
              {countryOptions.map((country) => (
                <CommandItem
                  key={country.value}
                  value={country.label}
                  onSelect={() => {
                    onValueChange(country.value);
                    setOpen(false);
                  }}
                  className="!text-slate-900 aria-selected:!bg-slate-100 aria-selected:!text-slate-900"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-[#1E5F74]",
                      value === country.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {country.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
