import { create } from "zustand";

/**
 * Onboarding Store - Client-side state management for the onboarding wizard
 *
 * Manages the current step, total steps, navigation logic, and accumulated data
 * for the multi-step onboarding process.
 *
 * Steps:
 * 1. PROFILE - User profile information
 * 2. EXPERIENCE - Current role and experience level
 * 3. PATH_SELECTION - Career goals and target role
 *
 * @layer Interface (Web)
 */

export type OnboardingStep =
  | "PROFILE"
  | "EXPERIENCE"
  | "PATH_SELECTION"
  | "GOALS_DIRECT"
  | "GOALS_DISCOVERY"
  | "ROADMAP_PREVIEW";

export type OnboardingPath = "DIRECT" | "DISCOVERY";

/**
 * Onboarding data shape
 */
interface OnboardingData {
  // Profile step
  name?: string;
  bio?: string;
  region?: string;

  // Experience step
  currentRole?: string;
  yearsExperience?: number;

  // Path selection
  path?: OnboardingPath;

  // Direct goals (for DIRECT path)
  targetRole?: string;
  targetSeniority?: "Junior" | "Mid" | "Senior";

  // Discovery goals (for DISCOVERY path)
  interests?: string;
  dislike?: string;

  // Additional fields can be added as needed
  [key: string]: unknown;
}

interface OnboardingStore {
  // State
  currentStep: number;
  totalSteps: number;
  step: OnboardingStep;
  data: OnboardingData;
  isLoading: boolean;

  // Actions - Navigation
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  setStep: (step: OnboardingStep) => void;
  reset: () => void;

  // Actions - Data Management
  updateData: (newData: Partial<OnboardingData>) => void;
  setData: (data: OnboardingData) => void;
  clearData: () => void;

  // Actions - Persistence
  saveCurrentStep: () => Promise<void>;
  syncWithServer: () => Promise<void>;
}

const STEP_MAP: Record<number, OnboardingStep> = {
  1: "PROFILE",
  2: "EXPERIENCE",
  3: "PATH_SELECTION",
  4: "GOALS_DIRECT", // or GOALS_DISCOVERY (depends on path)
  5: "ROADMAP_PREVIEW",
};

const REVERSE_STEP_MAP: Record<OnboardingStep, number> = {
  PROFILE: 1,
  EXPERIENCE: 2,
  PATH_SELECTION: 3,
  GOALS_DIRECT: 4,
  GOALS_DISCOVERY: 4, // Same step number (branching)
  ROADMAP_PREVIEW: 5,
};

/**
 * Zustand store for onboarding wizard state
 *
 * @example
 * ```tsx
 * const { currentStep, totalSteps, data, nextStep, updateData } = useOnboardingStore();
 *
 * // Update data
 * updateData({ name: "John", region: "North America" });
 *
 * // Navigate forward
 * nextStep();
 *
 * // Save progress
 * await saveCurrentStep();
 * ```
 */
export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  // Initial state
  currentStep: 1,
  totalSteps: 5,
  step: "PROFILE",
  data: {},
  isLoading: false,

  // ========================================
  // Navigation Actions
  // ========================================

  // Navigate to next step
  nextStep: () =>
    set((state) => {
      if (state.currentStep < state.totalSteps) {
        const newStep = state.currentStep + 1;
        return {
          currentStep: newStep,
          step: STEP_MAP[newStep],
        };
      }
      return state;
    }),

  // Navigate to previous step
  previousStep: () =>
    set((state) => {
      if (state.currentStep > 1) {
        const newStep = state.currentStep - 1;
        return {
          currentStep: newStep,
          step: STEP_MAP[newStep],
        };
      }
      return state;
    }),

  // Go to specific step by number
  goToStep: (stepNumber: number) =>
    set((state) => {
      if (stepNumber >= 1 && stepNumber <= state.totalSteps) {
        return {
          currentStep: stepNumber,
          step: STEP_MAP[stepNumber],
        };
      }
      return state;
    }),

  // Set step by name
  setStep: (stepName: OnboardingStep) =>
    set(() => ({
      currentStep: REVERSE_STEP_MAP[stepName],
      step: stepName,
    })),

  // Reset to initial state
  reset: () =>
    set(() => ({
      currentStep: 1,
      step: "PROFILE",
      data: {},
      isLoading: false,
    })),

  // ========================================
  // Data Management Actions
  // ========================================

  // Update data (merge with existing)
  updateData: (newData: Partial<OnboardingData>) =>
    set((state) => ({
      data: {
        ...state.data,
        ...newData,
      },
    })),

  // Replace all data
  setData: (data: OnboardingData) =>
    set(() => ({
      data,
    })),

  // Clear all data
  clearData: () =>
    set(() => ({
      data: {},
    })),

  // ========================================
  // Persistence Actions
  // ========================================

  /**
   * Saves the current step and data to the server
   *
   * TODO: Implement actual API call to persist onboarding state
   * For now, this is a placeholder that simulates a save operation
   */
  saveCurrentStep: async () => {
    const state = get();
    set({ isLoading: true });

    try {
      // TODO: Replace with actual API call
      // await fetch('/api/onboarding', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     currentStep: state.step,
      //     data: state.data,
      //   }),
      // });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Saved onboarding progress:", {
        step: state.step,
        data: state.data,
      });
    } catch (error) {
      console.error("Error saving onboarding progress:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Syncs onboarding state from the server
   *
   * Called on mount to restore progress from previous session
   *
   * TODO: Implement actual API call to fetch onboarding state
   * For now, this is a placeholder that checks localStorage
   */
  syncWithServer: async () => {
    set({ isLoading: true });

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/onboarding');
      // const serverState = await response.json();

      // For now, check localStorage as fallback
      const savedState = localStorage.getItem("onboarding_state");
      if (savedState) {
        const parsed = JSON.parse(savedState);
        set({
          currentStep: parsed.currentStep || 1,
          step: parsed.step || "PROFILE",
          data: parsed.data || {},
        });
      }
    } catch (error) {
      console.error("Error syncing onboarding state:", error);
      // Don't throw - just use default state
    } finally {
      set({ isLoading: false });
    }
  },
}));
