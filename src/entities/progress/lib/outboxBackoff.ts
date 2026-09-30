export const OUTBOX_BACKOFF_BASE_MS = 2000
export const OUTBOX_BACKOFF_MAX_MS = 300000

export const computeOutboxBackoffMs = (
  attempts: number,
  random: () => number = Math.random,
): number => {
  const ceiling = Math.min(
    OUTBOX_BACKOFF_MAX_MS,
    OUTBOX_BACKOFF_BASE_MS * 2 ** Math.max(0, attempts),
  )
  const jitter = Math.min(Math.max(random(), 0), 1)
  const half = ceiling / 2
  return Math.min(Math.floor(half + jitter * half), OUTBOX_BACKOFF_MAX_MS)
}
