import type { ProgressData, ProgressEvent } from '../model/types'

const localDayKey = (iso: string): string => {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const aggregateEventsToDays = (
  events: ProgressEvent[],
): ProgressData[] => {
  type Bucket = {
    sum: number
    first: ProgressEvent
    comments: string[]
  }
  const byDay = new Map<string, Bucket>()

  for (const ev of events) {
    const key = localDayKey(ev.created_at)
    const bucket = byDay.get(key)
    if (bucket) {
      bucket.sum += ev.duration_seconds
      if (ev.comment) bucket.comments.push(ev.comment)
    } else {
      byDay.set(key, {
        sum: ev.duration_seconds,
        first: ev,
        comments: ev.comment ? [ev.comment] : [],
      })
    }
  }

  return Array.from(byDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([dayKey, { sum, first, comments }]) => ({
      id: `day:${dayKey}`,
      user_id: first.user_id,
      created_at: first.created_at,
      duration_seconds: sum,
      value: Math.round(sum / 60),
      comment: comments.length ? comments.join('\n---\n') : null,
    }))
}
