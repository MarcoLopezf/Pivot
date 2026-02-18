-- ============================================================
-- ContactMessage Retention Job
-- ============================================================
-- Purpose : Hard-delete soft-deleted ContactMessage rows older
--           than the retention period (default: 30 days).
--           Run this on a schedule to satisfy GDPR/CCPA erasure.
--
-- Retention policy: 30 days after soft-delete (deletedAt IS NOT NULL).
-- Adjust the interval below to match your policy.
--
-- HOW TO SCHEDULE
-- ───────────────
-- Option A — Supabase pg_cron (recommended for this stack):
--
--   SELECT cron.schedule(
--     'purge-contact-messages',   -- job name
--     '0 3 * * *',                -- daily at 03:00 UTC
--     $$
--       DELETE FROM "ContactMessage"
--       WHERE "deletedAt" IS NOT NULL
--         AND "deletedAt" < NOW() - INTERVAL '30 days';
--     $$
--   );
--
--   Enable pg_cron in Supabase Dashboard → Database → Extensions.
--
-- Option B — Vercel Cron (edge function):
--   Add a cron route at src/app/api/cron/purge-contact-messages/route.ts
--   that calls this query via Prisma, and configure vercel.json:
--
--   "crons": [{ "path": "/api/cron/purge-contact-messages", "schedule": "0 3 * * *" }]
--
--   Protect the route with a shared secret (CRON_SECRET env var).
--
-- ============================================================

DELETE FROM "ContactMessage"
WHERE "deletedAt" IS NOT NULL
  AND "deletedAt" < NOW() - INTERVAL '30 days';
