# 📋 Technical Debt & Future Improvements

This document tracks architectural improvements, refactors, and optimizations that should be addressed in future sprints.

---

## 🔴 High Priority

### Implement Result<T> Pattern for Application Layer

**Status:** Pending
**Created:** 2026-02-02
**Estimated Effort:** 6-9 hours
**Impact:** High (architecture alignment)

**Problem:**
Currently, use cases in the application layer do not follow CLAUDE.md guidelines for error handling:
- Most use cases throw exceptions directly
- Some return `null` for "not found" cases
- Inconsistent error handling patterns across the codebase
- According to CLAUDE.md: "Application layer must catch domain exceptions and return Result type"

**Current State:**
```typescript
// Current implementation (inconsistent)
async execute(): Promise<SomeDTO | null>  // Some use cases
async execute(): Promise<SomeDTO>         // Some use cases (throw on error)
```

**Desired State:**
```typescript
// Target implementation (Result<T> pattern)
async execute(): Promise<Result<SomeDTO>>

// Where Result<T> is:
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } }
```

**Benefits:**
- ✅ Type-safe error handling
- ✅ Explicit success/failure states
- ✅ Consistent error handling across all use cases
- ✅ Better alignment with Clean Architecture principles
- ✅ Easier to distinguish "no data" from "error occurred"

**Scope:**
- **Create:** `src/application/common/Result.ts` (new type)
- **Refactor:** 10 use cases in `src/application/use-cases/`
- **Update:** 8 API routes in `src/app/api/`
- **Update:** 12 test files (7 unit + 5 integration)
- **Total:** 31 files affected

**Implementation Checklist:**
- [ ] Create `Result<T>` type with success/error variants
- [ ] Define standard error codes (VALIDATION_ERROR, NOT_FOUND, INTERNAL_ERROR, etc.)
- [ ] Refactor `GetItemResources` use case to return `Result<LearningResource[]>`
- [ ] Refactor remaining 9 use cases
- [ ] Update all API routes to handle Result<T> responses
- [ ] Update unit tests for use cases
- [ ] Update integration tests for API routes
- [ ] Run `pnpm verify` to ensure no regressions
- [ ] Update CLAUDE.md with Result<T> usage examples if needed

**Related Issues:**
- CodeRabbit review comment on GetItemResources (2026-02-02)
- CLAUDE.md Application Layer guidelines

**Notes:**
- Quick fix implemented: Removed `try/catch` block from `GetItemResources` to allow errors to propagate (2026-02-02)
- This allows API routes to properly return 500 status codes on errors
- Full Result<T> refactor should be scheduled for next sprint

---

## 🟡 Medium Priority

### Implement Email Verification Flow

**Status:** Pending
**Created:** 2026-02-04
**Estimated Effort:** 4-6 hours
**Impact:** Medium (security, user experience)

**Problem:**
Currently, email verification is disabled to allow immediate onboarding after user registration. Users can create accounts and access the full platform without confirming their email address. This creates potential security and data quality issues:
- No verification that users own the email address they register with
- Potential for spam/bot accounts
- Users might lose access if they mistype their email
- No mechanism to handle password resets securely

**Current State:**
```typescript
// src/app/login/page.tsx (lines 118-161)
// After signup, users are redirected directly to onboarding
// Supabase email confirmation is disabled in dashboard
if (data.user) {
  // Immediate redirect without email verification
  router.push("/onboarding/profile");
}
```

**Desired State:**
```typescript
// Complete email verification flow:
// 1. User signs up → Account created but not verified
// 2. Verification email sent → "Check your email" message shown
// 3. User clicks verification link → Email confirmed
// 4. User can now access full platform
// 5. Resend verification option available
```

**Benefits:**
- ✅ Improved security (verified email ownership)
- ✅ Better data quality (valid email addresses)
- ✅ Enables password reset functionality
- ✅ Prevents spam/bot accounts
- ✅ Standard authentication best practice

**Scope:**
- **Update:** `src/app/login/page.tsx` - Implement verification flow
- **Update:** `src/app/auth/callback/route.ts` - Handle email verification redirects
- **Create:** Email verification status UI component
- **Create:** Resend verification email functionality
- **Update:** User profile to track verification status
- **Update:** Middleware to handle unverified users appropriately
- **Configure:** Re-enable email confirmation in Supabase dashboard
- **Update:** Tests for email verification flow
- **Total:** ~8 files affected

**Implementation Checklist:**
- [ ] Re-enable "Confirm email" in Supabase dashboard (Authentication → Providers → Email)
- [ ] Update signup handler to show "Check your email" message
- [ ] Create email verification status banner component
- [ ] Implement "Resend verification email" functionality
- [ ] Update auth callback to handle email verification events
- [ ] Add `emailVerified` check in relevant areas
- [ ] Decide on UX: Block access completely vs. show banner with limited access
- [ ] Add email verification status to user profile/settings
- [ ] Update middleware to handle unverified users (if blocking access)
- [ ] Write integration tests for verification flow
- [ ] Test email templates in Supabase dashboard
- [ ] Run `pnpm verify` to ensure no regressions
- [ ] Update documentation with email verification flow

**Related Files:**
- `src/app/login/page.tsx` (lines 115-161) - Contains TODO comments
- `src/app/auth/callback/route.ts` - Auth callback handler
- `src/infrastructure/auth/supabase/middleware.ts` - Auth middleware
- `src/middleware.ts` - Route protection logic

**Notes:**
- Quick fix implemented: Email verification disabled temporarily to allow immediate onboarding (2026-02-04)
- TODO comments added in code marking this as technical debt
- Consider UX approach: full blocking vs. banner notification for unverified users
- May need to handle existing users created without verification differently

**Configuration Required:**
```bash
# Supabase Dashboard Settings
# Path: Authentication → Providers → Email
# Enable: "Confirm email"
# Customize: Email templates (verification, password reset)
```

---

## 🟢 Low Priority

### Add Email Notification for Contact Form Submissions

**Status:** Pending
**Created:** 2026-02-17
**Estimated Effort:** 2-3 hours
**Impact:** Low (user experience)

**Problem:**
Contact form submissions are stored in PostgreSQL but no email notification is sent to the team. Submissions can only be found by querying the database directly.

**Desired State:**
- Send an email notification to the team when a new contact message is submitted
- Include the full message details (name, email, inquiry type, message)

**Recommended Approach:**
- Use [Resend](https://resend.com) as the email provider (excellent Next.js integration)
- Create an email service in the infrastructure layer (`src/infrastructure/email/`)
- Update `submitContactAction` to call the email service after DB insert
- Add `RESEND_API_KEY` and `CONTACT_NOTIFICATION_EMAIL` to env config

**Scope:**
- **Create:** `src/infrastructure/email/ResendEmailService.ts`
- **Update:** `src/interfaces/web/actions/contactActions.ts`
- **Update:** `.env.example` with new env vars
- **Total:** ~3 files affected

---

## ✅ Completed

_(Items will be moved here when completed)_

---

## 📝 How to Use This Document

1. **Adding New Items:**
   - Add to the appropriate priority section
   - Include: Status, Created date, Estimated effort, Problem description, Desired state
   - Link to related issues or discussions

2. **Updating Items:**
   - Move between priority sections as needed
   - Update status as work progresses
   - Move to "Completed" section when done

3. **Priority Levels:**
   - 🔴 **High:** Architectural issues, security concerns, blocking problems
   - 🟡 **Medium:** Performance improvements, code quality, developer experience
   - 🟢 **Low:** Nice-to-haves, minor refactors, optimizations

---

**Last Updated:** 2026-02-17
