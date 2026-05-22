import { useMemo } from 'react'
import { useEventsLast30Days } from '@/entities/progress'

export const useRecentDescriptions = (limit = 3) => {
  const { events } = useEventsLast30Days()

  return useMemo(() => {
    const seen = new Set<string>()
    const out: string[] = []
    for (let i = events.length - 1; i >= 0 && out.length < limit; i--) {
      const raw = events[i].comment?.trim()
      if (!raw) continue
      const key = raw.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(raw)
    }
    return out
  }, [events, limit])
}
