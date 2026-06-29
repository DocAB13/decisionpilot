-- Migration: 20260615000001_create_stuck_analysis_cleanup_cron.sql
-- IR01-024: Revert Decisions stuck in in_analysis for > 5 minutes back to draft
-- (FR-06.3, H13 §3.4). Runs every 5 minutes via pg_cron.
-- NOTE: pg_cron must be enabled (done in IR01-023) before applying this migration.

-- Remove existing job if present so this migration is idempotent
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'revert-stuck-in-analysis-decisions';

SELECT cron.schedule(
  'revert-stuck-in-analysis-decisions',
  '*/5 * * * *',
  $$
  UPDATE public.decisions
  SET status = 'draft', updated_at = now()
  WHERE status = 'in_analysis'
    AND updated_at < now() - interval '5 minutes';

  INSERT INTO public.decision_state_transitions (decision_id, from_status, to_status, trigger)
  SELECT id, 'in_analysis', 'draft', 'system_event'
  FROM public.decisions
  WHERE status = 'draft'
    AND updated_at > now() - interval '10 seconds';
  $$
);
