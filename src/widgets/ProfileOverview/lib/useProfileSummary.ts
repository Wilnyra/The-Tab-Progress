import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { selectAllPathRows } from '@/entities/path'
import {
  progressContext,
  summarizeDailyTotals,
  useDailyTotals,
} from '@/entities/progress'

export type ProfileSummary = {
  daysSinceStart: number
  totalSeconds: number
  activeDays: number
  milestones: number
}

type MilestonesState = {
  count: number | null
  isLoading: boolean
  error: Error | null
}

type UseProfileSummaryResult = {
  summary: ProfileSummary | null
  isLoading: boolean
  error: Error | null
  reload: () => void
}

const toError = (value: unknown, fallback: string): Error =>
  value instanceof Error ? value : new Error(fallback)

const sumSeconds = (totals: ReadonlyMap<string, number>): number => {
  let total = 0
  for (const seconds of totals.values()) total += seconds
  return total
}

export const useProfileSummary = (): UseProfileSummaryResult => {
  const { progressReload } = useContext(progressContext)
  const [reloadTick, setReloadTick] = useState(0)
  const daily = useDailyTotals('all', reloadTick)
  const [milestones, setMilestones] = useState<MilestonesState>({
    count: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const controller = new AbortController()
    setMilestones((prev) => ({ ...prev, isLoading: true, error: null }))

    selectAllPathRows(controller.signal)
      .then(({ data, error }) => {
        if (controller.signal.aborted) return
        setMilestones((prev) =>
          error
            ? { count: prev.count, isLoading: false, error }
            : { count: data.length, isLoading: false, error: null },
        )
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setMilestones((prev) => ({
          count: prev.count,
          isLoading: false,
          error: toError(error, 'Failed to load milestones'),
        }))
      })

    return () => controller.abort()
  }, [reloadTick, progressReload])

  const reload = useCallback(() => setReloadTick((tick) => tick + 1), [])

  const { totals, loadedRange } = daily
  const milestoneCount = milestones.count

  const summary = useMemo<ProfileSummary | null>(() => {
    if (loadedRange !== 'all' || milestoneCount === null) return null
    const days = summarizeDailyTotals(totals)
    return {
      daysSinceStart: days?.daysSinceStart ?? 0,
      totalSeconds: sumSeconds(totals),
      activeDays: days?.activeDays ?? 0,
      milestones: milestoneCount,
    }
  }, [loadedRange, milestoneCount, totals])

  const error = milestones.error ?? daily.error

  useEffect(() => {
    if (import.meta.env.DEV && error !== null) {
      console.error('Profile: failed to load summary', error)
    }
  }, [error])

  return {
    summary,
    isLoading: summary === null && error === null,
    error,
    reload,
  }
}
