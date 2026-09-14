-- Convert progress to event-log model with proper time storage.
-- Adds duration_seconds (canonical seconds), backfills from existing minutes,
-- enforces NOT NULL, adds range-scan index, creates progress_sum_range RPC.
-- The legacy `value` column (minutes) is preserved as a safety net and is
-- expected to be dropped in a separate later migration after a soak window.

BEGIN;

-- 1. Canonical time column (seconds, integer; ~68 years per event headroom).
ALTER TABLE public.progress
  ADD COLUMN IF NOT EXISTS duration_seconds integer;

-- 2. Backfill from existing minute values (idempotent: only touches NULL rows).
UPDATE public.progress
SET duration_seconds = value * 60
WHERE duration_seconds IS NULL;

-- 3. Lock the column: every event must have a duration; default keeps inserts safe.
ALTER TABLE public.progress
  ALTER COLUMN duration_seconds SET NOT NULL,
  ALTER COLUMN duration_seconds SET DEFAULT 0;

-- 4. Index for per-user ranged scans (used by sums and event-range queries).
CREATE INDEX IF NOT EXISTS progress_user_created_idx
  ON public.progress (user_id, created_at DESC);

-- 5. Sum of duration_seconds in [start_ts; end_ts) for the authenticated user.
--    SECURITY INVOKER: runs as caller, so RLS policies on `progress` still apply.
--    STABLE: result is deterministic for same inputs within a transaction.
CREATE OR REPLACE FUNCTION public.progress_sum_range(
  start_ts timestamptz,
  end_ts timestamptz
)
RETURNS bigint
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
  SELECT coalesce(sum(duration_seconds), 0)::bigint
  FROM public.progress
  WHERE created_at >= start_ts
    AND created_at < end_ts
    AND user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.progress_sum_range(timestamptz, timestamptz) TO authenticated;

COMMIT;
