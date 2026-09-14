import type { ProgressEvent } from '../model/types'

export type ProgressDayEntry = {
  id: string
  text: string | null
  durationSeconds: number
  createdAt: string
}

export type ProgressDayRow = {
  dayKey: string
  dayStart: string
  totalSeconds: number
  entries: ProgressDayEntry[]
}

const localDayKey = (iso: string): string => {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const localDayStart = (iso: string): string => {
  const d = new Date(iso)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

/**
 * Groups raw progress events into one row per local day, newest day first,
 * keeping every entry of that day with its own duration.
 */
export const aggregateEventsToDayRows = (
  events: ProgressEvent[],
): ProgressDayRow[] => {
  const byDay = new Map<string, ProgressDayRow>()

  for (const event of events) {
    const dayKey = localDayKey(event.created_at)
    const text = event.comment?.trim()
    const entry: ProgressDayEntry = {
      id: event.id,
      text: text ? text : null,
      durationSeconds: event.duration_seconds,
      createdAt: event.created_at,
    }
    const row = byDay.get(dayKey)

    if (row) {
      row.totalSeconds += event.duration_seconds
      row.entries.push(entry)
      continue
    }

    byDay.set(dayKey, {
      dayKey,
      dayStart: localDayStart(event.created_at),
      totalSeconds: event.duration_seconds,
      entries: [entry],
    })
  }

  return Array.from(byDay.values()).sort((a, b) =>
    b.dayKey.localeCompare(a.dayKey),
  )
}
