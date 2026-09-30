-- Progress: client-generated idempotency key for offline resend.
-- Nullable; legacy rows stay NULL (NULLs are distinct, no backfill). Idempotent.

BEGIN;

ALTER TABLE public.progress ADD COLUMN IF NOT EXISTS client_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'progress_user_client_id_key'
      AND conrelid = 'public.progress'::regclass
  ) THEN
    ALTER TABLE public.progress
      ADD CONSTRAINT progress_user_client_id_key UNIQUE (user_id, client_id);
  END IF;
END $$;

COMMIT;
