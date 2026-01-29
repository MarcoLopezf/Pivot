/**
 * Temporary storage utility for onboarding flow
 *
 * Manages userId persistence during onboarding until NextAuth is implemented.
 * Uses sessionStorage to maintain state across page navigations.
 *
 * TODO: Replace with NextAuth session when authentication is implemented
 */

const STORAGE_KEY = "pivot_onboarding_userId";

/**
 * Save userId to sessionStorage after profile creation
 */
export function saveOnboardingUserId(userId: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEY, userId);
  }
}

/**
 * Get userId from sessionStorage during onboarding
 * Returns null if not found (user hasn't completed profile step)
 */
export function getOnboardingUserId(): string | null {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem(STORAGE_KEY);
  }
  return null;
}

/**
 * Clear userId from sessionStorage (e.g., on logout or onboarding completion)
 */
export function clearOnboardingUserId(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}
