import { useContext, useEffect, useState } from 'react'
import { selectEventsBetween } from '../api/selectEventsBetween'
import { progressContext } from '../model/ProgressContext'
import { localDayKey } from './localDayKey'

export type DailyTotalsRange = number | 'all'

type UseDailyTotalsResult = {
  totals: ReadonlyMap<string, number>
  loadedRange: DailyTotalsRange | null
  isLoading: boolean
  error: Error | null
}

const EMPTY_TOTALS: ReadonlyMap<string, number> = new Map()
const ALL_TIME_START = new Date(0)

const INITIAL_STATE: UseDailyTotalsResult = {
  totals: EMPTY_TOTALS,
  loadedRange: null,
  isLoading: false,
  error: null,
}

const rangeStart = (range: DailyTotalsRange): Date => {
  if (range === 'all') return ALL_TIME_START
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (range - 1))
  return start
}

export const useDailyTotals = (
  range: DailyTotalsRange | null,
): UseDailyTotalsResult => {
  const { progressReload } = useContext(progressContext)
  const [state, setState] = useState<UseDailyTotalsResult>(INITIAL_STATE)

  useEffect(() => {
    if (range === null) return

    const controller = new AbortController()
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    selectEventsBetween(rangeStart(range), new Date(), controller.signal)
      .then(({ data, error }) => {
        if (controller.signal.aborted) return
        if (error) {
          setState({
            totals: EMPTY_TOTALS,
            loadedRange: null,
            isLoading: false,
            error: new Error(error.message),
          })
          return
        }
        const totals = new Map<string, number>()
        for (const event of data) {
          const key = localDayKey(new Date(event.created_at))
          totals.set(key, (totals.get(key) ?? 0) + event.duration_seconds)
        }
        setState({ totals, loadedRange: range, isLoading: false, error: null })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({
          totals: EMPTY_TOTALS,
          loadedRange: null,
          isLoading: false,
          error:
            error instanceof Error
              ? error
              : new Error('Failed to load daily totals'),
        })
      })

    return () => controller.abort()
  }, [range, progressReload])

  return state
}
