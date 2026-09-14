-- Convert progress.created_at from DATE to TIMESTAMPTZ.
-- Old rows: DATE values are reinterpreted as midnight UTC of that day
-- (no time information existed; collision-free for the legacy one-row-per-day
-- model). New rows: DEFAULT switches to now() so multiple events per day
-- get distinct timestamps, suitable for hourly views.
-- This unblocks event-level filtering: PostgREST will no longer coerce
-- timestamptz filters to date, fixing the "today's rows missing from SELECT"
-- issue.

BEGIN;

ALTER TABLE public.progress
  ALTER COLUMN created_at TYPE timestamptz
  USING (created_at::timestamp AT TIME ZONE 'UTC');

ALTER TABLE public.progress
  ALTER COLUMN created_at SET DEFAULT now();

COMMIT;
