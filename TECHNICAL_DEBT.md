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

_(Empty - add items as they are identified)_

---

## 🟢 Low Priority

_(Empty - add items as they are identified)_

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

**Last Updated:** 2026-02-02
