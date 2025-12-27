import { ProgressData } from ".."

export const getLastQueueArray = (data: ProgressData[]): ProgressData[] => {
  if (!data.length) return []

  const sorted = [...data].sort((a, b) => {
    const aTime = new Date(a.created_at).getTime()
    const bTime = new Date(b.created_at).getTime()
    return aTime - bTime
  })

  const uniqueDates = Array.from(
    new Set(sorted.map((d) => d.created_at.split("T")[0]))
  )

  const dates = uniqueDates.map((d) => new Date(d + "T00:00:00"))
  const endIndex = dates.length - 1

  let startIndex = endIndex

  for (let i = endIndex; i > 0; i--) {
    const curr = dates[i]
    const prev = dates[i - 1]

    const diffDays =
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays === 1) {
      startIndex = i - 1
    } else {
      break
    }
  }

  const startDate = uniqueDates[startIndex]

  return sorted.filter((item) => {
    const dateOnly = item.created_at.split("T")[0]
    return dateOnly >= startDate
  })
}
