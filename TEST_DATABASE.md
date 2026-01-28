# Test Database Setup

This document describes the test database infrastructure for running integration tests.

## Prerequisites

- Docker Desktop installed and running
- pnpm package manager

## Database Infrastructure

### Files Created

- **docker-compose.yml**: Defines PostgreSQL 15 container for testing
- **.env.test**: Contains `DATABASE_URL` for test database
- **TEST_DATABASE.md**: This documentation file

### Dependencies Added

- `dotenv-cli`: Load environment variables from custom .env files
- `@prisma/adapter-pg`: Prisma 7 adapter for PostgreSQL direct connections
- `pg`: PostgreSQL driver for Node.js
- `@types/pg`: TypeScript types for pg

## Running Integration Tests

### 1. Start Test Database

```bash
pnpm db:test:up
```

This starts a PostgreSQL container named `pivot-db-test` on port 5432.

### 2. Push Schema to Test Database

```bash
pnpm db:test:push
```

This synchronizes the Prisma schema with the test database (creates tables, enums, etc.).

### 3. Run Integration Tests

```bash
pnpm test:int
```

This runs all integration tests in `src/tests/integration/` using `.env.test` configuration.

### 4. Stop Test Database (Optional)

```bash
pnpm db:test:down
```

This stops and removes the PostgreSQL container.

## Test Scripts Summary

| Script | Description |
|--------|-------------|
| `pnpm test` | Run all tests (unit + integration, integration skipped if no DATABASE_URL) |
| `pnpm test:int` | Run only integration tests with `.env.test` |
| `pnpm db:test:up` | Start PostgreSQL Docker container |
| `pnpm db:test:push` | Push Prisma schema to test database |
| `pnpm db:test:down` | Stop and remove PostgreSQL container |

## Environment Variables

### .env.test

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pivot_test?schema=public"
```

### .env (for development)

```
DATABASE_URL="postgresql://localhost:5432/pivot_dev"
DATABASE_URL_TEST="postgresql://localhost:5432/pivot_test"
```

## Integration Test Structure

Integration tests are located in `src/tests/integration/` and follow this pattern:

```typescript
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

describe.skipIf(!process.env.DATABASE_URL)("Test Suite", () => {
  let db: PrismaClient;
  let pool: Pool;

  beforeEach(async () => {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    db = new PrismaClient({ adapter });
    // Clean database state
    await db.user.deleteMany();
  });

  afterAll(async () => {
    await db.$disconnect();
    await pool.end();
  });

  // ... tests
});
```

## Prisma 7 Adapter Pattern

Prisma 7 requires database adapters for direct connections. The project uses:

- **@prisma/adapter-pg** with **pg** driver for PostgreSQL
- Adapter is configured in both:
  - `src/infrastructure/database/PrismaClient.ts` (production singleton)
  - Integration test setup (test-specific instances)

## Troubleshooting

### "Cannot connect to Docker daemon"

Ensure Docker Desktop is running:

```bash
open -a Docker
```

### "Port 5432 already in use"

Stop any local PostgreSQL service:

```bash
brew services stop postgresql@14
```

Or change the port in `docker-compose.yml`.

### Integration tests are skipped

Integration tests are skipped when `DATABASE_URL` is not set. Use `pnpm test:int` (which loads `.env.test`) instead of `pnpm test`.

## CI/CD Integration

For CI pipelines, the workflow should be:

```yaml
- name: Start test database
  run: pnpm db:test:up

- name: Push schema
  run: pnpm db:test:push

- name: Run integration tests
  run: pnpm test:int

- name: Stop test database
  run: pnpm db:test:down
```
