-- Migration: 20260615000000_create_anonymous_cleanup_cron.sql
-- IR01-023: Schedule anonymous Decision cleanup every 6 hours (H12 §10.1, FR-01.5, BR-04)
-- NOTE: pg_cron extension must be enabled in Supabase Dashboard → Database → Extensions
--       before applying this migration.

-- Enable pg_cron extension (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove existing job if present so this migration is idempotent
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'cleanup-expired-anonymous-decisions';

-- Schedule anonymous Decision cleanup every 6 hours
SELECT cron.schedule(
  'cleanup-expired-anonymous-decisions',
  '0 */6 * * *',
  $$
  DELETE FROM public.decisions
  WHERE owner_id IS NULL
    AND expires_at < now();
  $$
);
