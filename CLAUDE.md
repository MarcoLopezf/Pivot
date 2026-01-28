# 🤖 CLAUDE.md - Development Rules for Claude Code

**Project:** PIVOT AI | **Version:** 1.0

---

## 🛠️ STACK (Core Technologies)

- **Language:** TypeScript 5.4+ (strict mode, NO `any`)
- **Framework:** Next.js 14.2+ (App Router)
- **Database:** PostgreSQL 15+ (Prisma ORM, pgvector extension)
- **AI:** Google Genkit 0.5+ (Gemini 2.0 Flash)
- **Auth:** NextAuth.js 5.0-beta (Email/Password + GitHub OAuth optional)
- **Testing:** Vitest (unit/integration), Playwright (E2E), MSW (API mocking)
- **UI:** React 18.3+, Tailwind CSS, shadcn/ui, Recharts, Framer Motion
- **Deployment:** Vercel + Supabase + Upstash Redis

---

## 🏛️ ARCHITECTURE (Hexagonal / Clean Architecture)

### 4 Layers - Dependencies Flow Inward

**INTERFACES (API Routes, UI)** → Orchestrates everything  
↓  
**APPLICATION (Use Cases)** → Orchestrates domain logic  
↓  
**DOMAIN (Business Logic)** → Pure TypeScript, ZERO external dependencies  
↑  
**INFRASTRUCTURE (Adapters)** → Implements domain interfaces (Prisma, Genkit, APIs)

### ✅ MANDATORY RULES

- **Domain layer = ZERO external dependencies** (no Prisma, no Next.js, no Genkit imports)
- **Entities encapsulate business rules**, expose only methods (no raw setters)
- **Use cases orchestrate**, never contain business logic (they call domain services)
- **Repository interfaces (ports) live in domain**, implementations in infrastructure
- **Dependencies point inward only** (Dependency Inversion Principle)
- **Map Prisma models to domain entities** in infrastructure, never expose Prisma outside

### ❌ FORBIDDEN

- Importing from outer layers into inner layers (domain importing Prisma = violation)
- Business logic in use cases (belongs in domain services/entities)
- Exposing Prisma models outside infrastructure layer
- Mixing bounded contexts (Profile importing Learning entities)
- API routes talking directly to database (must go through use cases)

### Bounded Contexts (DDD)

- **Profile:** User identity, skills, authentication, experience
- **Learning:** Roadmaps, milestones, skill gaps, dependencies
- **Assessment:** Quizzes, projects, progress tracking, validation
- **Marketplace:** Resources, job stats, career transitions

---

## 📘 TYPESCRIPT RULES

- **Strict mode always enabled** (tsconfig.json)
- **NO `any` type ever** → Use `unknown` + type guards for truly unknown data
- **Explicit return types on all functions** (except trivial getters)
- **Zod for runtime validation** (all API inputs, environment variables)
- **Interfaces for public contracts**, types for internal structures
- **Enums for domain constants** (SkillLevel, DifficultyLevel, Platform, etc.)
- **Never use type assertions (`as`)** without validation first

---

## 🔴🟢 TDD WORKFLOW (Mandatory)

### Red → Green → Refactor Cycle

**Apply TDD to:** Domain entities, value objects, domain services, use cases, utilities

**Process:**
1. **RED:** Write failing test first (defines behavior)
2. **GREEN:** Write minimal code to pass test
3. **REFACTOR:** Improve code without breaking tests
4. **Repeat** for each new behavior/feature

**Never skip writing tests first** for domain and application layers.

---

## 🧪 TESTING STRATEGY

### Test Pyramid (70% Unit / 20% Integration / 10% E2E)

- **Unit (70%):** Domain entities, value objects, services, use cases, utilities
- **Integration (20%):** API routes, database operations (with test DB), external API calls (mocked with MSW)
- **E2E (10%):** Critical user flows (onboarding, roadmap generation, quiz validation)

### Coverage Targets

- **Domain layer:** 90%+ (critical business logic)
- **Application layer:** 80%+
- **Overall minimum:** 70%

---

## 📝 NAMING CONVENTIONS

- **Use Cases:** Verb + Noun (CreateUserProfile, GenerateRoadmap, EvaluateQuiz)
- **Entities:** Singular noun (User, LearningPath, Skill, Assessment)
- **Value Objects:** Descriptive noun (Email, SkillLevel, TimeEstimate, SkillGap)
- **Repository Interfaces:** I[Entity]Repository (IUserRepository, ILearningPathRepository)
- **Repository Implementations:** Prisma[Entity]Repository (PrismaUserRepository)
- **DTOs:** [Entity]DTO (ProfileDTO, RoadmapDTO, AssessmentDTO)
- **API Routes:** kebab-case (/api/profile, /api/learning/roadmap, /api/assessment/quiz)
- **React Components:** PascalCase (ProfileForm, RoadmapTimeline, SkillCard)
- **Files:** Entities/Classes = PascalCase (User.ts, Email.ts), utilities = camelCase (formatDate.ts)

---

## ⚠️ ERROR HANDLING

### Domain Layer

- Throw custom domain exceptions (InvalidEmailError, UserAlreadyExistsError)
- Extend DomainError base class for all domain exceptions
- Never throw generic "Error", always use specific domain errors

### Application Layer

- Catch domain exceptions, convert to Result type
- Return Result<T> with success/failure states
- Map domain errors to application-level error codes (INVALID_EMAIL, USER_EXISTS)
- Never let domain exceptions leak to API layer

### API Layer

- Standard response format: `{success: boolean, data?: T, error?: {code, message}}`
- Map application errors to HTTP status codes (400 for validation, 500 for internal)
- **Never expose:** Stack traces, database error details, internal implementation details
- Log errors server-side for debugging, return safe messages to client

---

## 🌿 GIT WORKFLOW

### Branch Strategy

**main** (production, protected) ← **develop** (integration, protected) ← **feature/\*** or **fix/\***

### Creating New Features

1. **Always branch from `develop`**: `git checkout develop && git pull`
2. **Create feature branch** with correct naming: `git checkout -b feature/roadmap-generation`
3. **Work with TDD** (Red → Green → Refactor for each component)
4. **Commit frequently** with conventional commits
5. **Before pushing**: Run `pnpm verify` (must pass completely)
6. **Push and create PR** to `develop`: `git push origin feature/roadmap-generation`

### Branch Naming Conventions

- **feature/description** for new features (feature/github-oauth, feature/quiz-validation)
- **fix/description** for bug fixes (fix/roadmap-ordering, fix/auth-token-expiry)
- Never commit directly to `main` or `develop` (always use PRs)

### Conventional Commits

**Format:** `<type>(<scope>): <description>`

**Types:** feat, fix, docs, test, refactor, chore, perf, ci

**Examples:** feat(profile): add GitHub OAuth | fix(roadmap): correct skill ordering | test(learning): add SkillGapAnalyzer tests

---

## 🔍 VERIFICATION & SCRIPTS

### Critical Command: `pnpm verify`

**Runs in order (ALL must pass):**
1. **Lint** → 0 ESLint errors
2. **Format check** → All files properly formatted
3. **Type check** → 0 TypeScript errors
4. **Tests** → All tests pass (unit + integration)
5. **Build** → Production build succeeds

### When to Run `pnpm verify`

- **Before every push** (pre-push hook enforces this)
- **After completing a feature** (before creating PR)
- **After fixing a bug** (before creating PR)
- **After resolving merge conflicts**
- **Daily before starting work** (ensure clean state)

### Available Scripts

- `pnpm dev` - Development server
- `pnpm build` - Production build
- `pnpm test` - Run tests in watch mode
- `pnpm test --run` - Run tests once
- `pnpm lint` - Lint code
- `pnpm format` - Format all files
- `pnpm type-check` - TypeScript type checking
- `pnpm db:migrate` - Run Prisma migrations
- `pnpm db:studio` - Open Prisma Studio
- `pnpm verify` - **CRITICAL: Run before every push**

---

## ✅ PRE-PUSH CHECKLIST

Before pushing code or creating PR:

**Quality:**
- [ ] `pnpm verify` passes completely
- [ ] Code formatted with Prettier
- [ ] No console.logs in production code

**Git:**
- [ ] Branch follows naming (feature/\* or fix/\*)
- [ ] Commits follow conventional format
- [ ] Small, atomic commits with clear messages

---

## 🎯 GOLDEN RULES (Never Break)

1. **TDD always** - Write tests first (Red → Green → Refactor)
2. **`pnpm verify` must pass** - Before every push, no exceptions
3. **Architecture first** - Correct layer, correct dependencies
4. **Type safety** - No `any`, explicit types everywhere
5. **Small commits** - Atomic changes with clear conventional messages
6. **Branch per feature** - Always create feature/\* or fix/\* branch from develop
7. **Domain purity** - Domain layer = pure TypeScript, zero external dependencies

---

**Quick Reference:**
- Domain = Pure business logic (zero deps)
- Application = Orchestration (use cases call domain)
- Infrastructure = Implementations (Prisma, Genkit, APIs)
- Interfaces = Entry points (API routes, UI components)