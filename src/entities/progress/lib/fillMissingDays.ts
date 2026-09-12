import type { ProgressData } from '../model/types'

const localDayKey = (iso: string): string => {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const fillMissingDays = (
  days: ProgressData[],
  dayCount: number,
  now: Date = new Date(),
): ProgressData[] => {
  const byDay = new Map(days.map((day) => [localDayKey(day.created_at), day]))
  const userId = days[0]?.user_id ?? ''
  const cursor = new Date(now)
  cursor.setHours(0, 0, 0, 0)
  cursor.setDate(cursor.getDate() - (dayCount - 1))

  const filled: ProgressData[] = []
  for (let i = 0; i < dayCount; i++) {
    const createdAt = cursor.toISOString()
    const key = localDayKey(createdAt)
    filled.push(
      byDay.get(key) ?? {
        id: `day:${key}`,
        user_id: userId,
        created_at: createdAt,
        duration_seconds: 0,
        value: 0,
        comment: null,
      },
    )
    cursor.setDate(cursor.getDate() + 1)
  }
  return filled
}
