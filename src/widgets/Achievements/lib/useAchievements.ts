import { useCallback, useContext, useEffect, useState } from 'react'
import {
  computeAchievements,
  type AchievementsResult,
} from '@/entities/achievements'
import { selectClaimDates } from '@/entities/map'
import {
  localDayKey,
  progressContext,
  useDailyTotals,
} from '@/entities/progress'

type ClaimsState = {
  claimDates: string[] | null
  isLoading: boolean
  error: Error | null
}

type UseAchievementsResult = {
  data: AchievementsResult | null
  isLoading: boolean
  error: Error | null
  reload: () => void
}

const MIDNIGHT_GRACE_MS = 1000

const toError = (value: unknown, fallback: string): Error =>
  value instanceof Error ? value : new Error(fallback)

const msUntilNextMidnight = (): number => {
  const next = new Date()
  next.setHours(24, 0, 0, 0)
  return next.getTime() - Date.now() + MIDNIGHT_GRACE_MS
}

const useTodayKey = (): string => {
  const [todayKey, setTodayKey] = useState(() => localDayKey(new Date()))

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined

    const sync = (): void => {
      setTodayKey(localDayKey(new Date()))
      clearTimeout(timer)
      timer = setTimeout(sync, msUntilNextMidnight())
    }

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') sync()
    }

    timer = setTimeout(sync, msUntilNextMidnight())
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', sync)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', sync)
    }
  }, [])

  return todayKey
}

export const useAchievements = (): UseAchievementsResult => {
  const { progressReload } = useContext(progressContext)
  const [reloadTick, setReloadTick] = useState(0)
  const daily = useDailyTotals('all', reloadTick)
  const todayKey = useTodayKey()
  const [claims, setClaims] = useState<ClaimsState>({
    claimDates: null,
    isLoading: true,
    error: null,
  })
  const [data, setData] = useState<AchievementsResult | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setClaims((prev) => ({ ...prev, isLoading: true, error: null }))

    selectClaimDates(controller.signal)
      .then(({ data: claimDates, error }) => {
        if (controller.signal.aborted) return
        setClaims(
          error
            ? { claimDates: null, isLoading: false, error }
            : { claimDates, isLoading: false, error: null },
        )
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setClaims({
          claimDates: null,
          isLoading: false,
          error: toError(error, 'Failed to load map claims'),
        })
      })

    return () => controller.abort()
  }, [reloadTick, progressReload])

  const reload = useCallback(() => setReloadTick((tick) => tick + 1), [])

  const { claimDates } = claims
  const { totals } = daily
  const isSettled =
    !claims.isLoading &&
    claimDates !== null &&
    daily.loadedRange === 'all' &&
    !daily.isLoading

  useEffect(() => {
    if (!isSettled || claimDates === null) return
    setData(
      computeAchievements({
        dailyTotals: totals,
        claimDates,
        now: new Date(),
      }),
    )
  }, [isSettled, claimDates, totals, todayKey])

  const error = claims.error ?? daily.error

  useEffect(() => {
    if (import.meta.env.DEV && error !== null) {
      console.error('Achievements: failed to load sources', error)
    }
  }, [error])

  return {
    data,
    isLoading: data === null && error === null,
    error,
    reload,
  }
}
