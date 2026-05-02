import { useEffect, useState } from 'react'
import { rpcProgressSumRange } from '../api/rpcProgressSumRange'
import { useEventsLast30Days } from './useEventsLast30Days'
import { useAuth } from '@/entities/session'

export type TotalRangeKey = 90 | 180 | 360 | 'total'

const FROZEN_CACHE_PREFIX = 'progress_frozen_v1'

const startOfToday = (): Date => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

const rangeStart = (key: TotalRangeKey): Date => {
  if (key === 'total') return new Date(0)
  const d = startOfToday()
  d.setDate(d.getDate() - (key - 1))
  return d
}

const cacheKey = (
  userId: string,
  key: TotalRangeKey,
  today: Date,
): string => {
  const dayStr = today.toISOString().slice(0, 10)
  return `${FROZEN_CACHE_PREFIX}:${userId}:${key}:${dayStr}`
}

const readFrozenCache = (key: string): number | null => {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : null
  } catch {
    return null
  }
}

const writeFrozenCache = (key: string, value: number) => {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // localStorage may be unavailable (private mode / quota); skip silently.
  }
}

export const useTotalForRange = (rangeKey: TotalRangeKey) => {
  const { session } = useAuth()
  const userId = session?.user.id ?? ''
  const { events, isLoading: eventsLoading } = useEventsLast30Days()
  const [frozen, setFrozen] = useState<number | null>(null)
  const [frozenLoading, setFrozenLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    let cancelled = false
    const today = startOfToday()
    const start = rangeStart(rangeKey)
    const ck = cacheKey(userId, rangeKey, today)

    const cached = readFrozenCache(ck)
    if (cached !== null) {
      setFrozen(cached)
      setFrozenLoading(false)
      return
    }

    setFrozenLoading(true)
    rpcProgressSumRange(start, today).then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        setFrozen(0)
      } else {
        setFrozen(data)
        writeFrozenCache(ck, data)
      }
      setFrozenLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [userId, rangeKey])

  const todayStartMs = startOfToday().getTime()
  const recent = events.reduce(
    (sum, ev) =>
      new Date(ev.created_at).getTime() >= todayStartMs
        ? sum + ev.duration_seconds
        : sum,
    0,
  )

  const total = (frozen ?? 0) + recent
  const isLoading = frozenLoading || eventsLoading

  return { total, isLoading }
}
