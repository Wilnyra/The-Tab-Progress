import type { ProgressDayEntry } from './aggregateEventsToDayRows'

export type ProgressTaskGroup = {
  key: string
  text: string | null
  totalSeconds: number
  latest: ProgressDayEntry
  entries: ProgressDayEntry[]
}

const NO_NOTE_KEY = 'no-note'

const toTaskKey = (text: string | null): string => {
  const normalized = text?.trim().replace(/\s+/g, ' ').toLowerCase()
  return normalized ? `note:${normalized}` : NO_NOTE_KEY
}

const byNewest = (a: ProgressDayEntry, b: ProgressDayEntry): number =>
  b.createdAt.localeCompare(a.createdAt)

export const groupDayEntries = (
  entries: ProgressDayEntry[],
): ProgressTaskGroup[] => {
  const groups = new Map<string, ProgressTaskGroup>()

  for (const entry of entries) {
    const key = toTaskKey(entry.text)
    const group = groups.get(key)
    if (!group) {
      groups.set(key, {
        key,
        text: entry.text,
        totalSeconds: entry.durationSeconds,
        latest: entry,
        entries: [entry],
      })
      continue
    }
    group.totalSeconds += entry.durationSeconds
    group.entries.push(entry)
    if (entry.createdAt > group.latest.createdAt) {
      group.latest = entry
      group.text = entry.text
    }
  }

  return Array.from(groups.values())
    .map((group) => ({ ...group, entries: [...group.entries].sort(byNewest) }))
    .sort(
      (a, b) =>
        b.totalSeconds - a.totalSeconds ||
        b.latest.createdAt.localeCompare(a.latest.createdAt),
    )
}
