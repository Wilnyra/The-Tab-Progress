import { ProgressData } from "@/entities/progress"

export function getLastQueueInRow(data: ProgressData[]) {
  if (!data.length) return { streak: 0, from: null, to: null }

  // Sort ascending by date
  const sorted = [...data].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  // Remove duplicates
  const uniqueDates = Array.from(
    new Set(sorted.map((d) => d.created_at.split('T')[0]))
  )

  let streak = 1
  let endIndex = uniqueDates.length - 1

  for (let i = endIndex; i > 0; i--) {
    const current = new Date(uniqueDates[i])
    const prev = new Date(uniqueDates[i - 1])
    const diffDays = (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays === 1) {
      streak++
    } else {
      return {
        streak,
        from: uniqueDates[i],
        to: uniqueDates[endIndex],
      }
    }
  }

  return {
    streak,
    from: uniqueDates[0],
    to: uniqueDates[endIndex],
  }
}
