import { useCallback, useContext, useEffect, useState } from 'react'
import { selectClaimDates } from '@/entities/map'
import {
  buildJourney,
  selectAllPathRows,
  type Journey,
  type PathData,
} from '@/entities/path'
import { selectPhotoDates } from '@/entities/photos'
import { progressContext, useDailyTotals } from '@/entities/progress'
import { countDoneTodo } from '@/entities/todo'

type Sources = {
  milestones: PathData[]
  claimDates: string[]
  photoDates: string[]
  todosDone: number
}

type SourcesState = {
  sources: Sources | null
  isLoading: boolean
  error: Error | null
}

type UseJourneyDataResult = {
  journey: Journey | null
  isLoading: boolean
  error: Error | null
  reload: () => void
}

const toError = (value: unknown, fallback: string): Error =>
  value instanceof Error ? value : new Error(fallback)

const loadSources = async (signal: AbortSignal): Promise<Sources> => {
  const [milestones, claims, photos, todos] = await Promise.all([
    selectAllPathRows(signal),
    selectClaimDates(signal),
    selectPhotoDates(signal),
    countDoneTodo(signal),
  ])

  const failed = [milestones, claims, photos, todos].find((r) => r.error)
  if (failed?.error) throw new Error(failed.error.message)

  return {
    milestones: milestones.data,
    claimDates: claims.data,
    photoDates: photos.data,
    todosDone: todos.data,
  }
}

export const useJourneyData = (): UseJourneyDataResult => {
  const { progressReload } = useContext(progressContext)
  const [reloadTick, setReloadTick] = useState(0)
  const daily = useDailyTotals('all', reloadTick)
  const [state, setState] = useState<SourcesState>({
    sources: null,
    isLoading: true,
    error: null,
  })
  const [journey, setJourney] = useState<Journey | null>(null)
  const [isBuilt, setIsBuilt] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    loadSources(controller.signal)
      .then((sources) => {
        if (controller.signal.aborted) return
        setState({ sources, isLoading: false, error: null })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({
          sources: null,
          isLoading: false,
          error: toError(error, 'Failed to load the journey'),
        })
      })

    return () => controller.abort()
  }, [reloadTick, progressReload])

  const reload = useCallback(() => setReloadTick((tick) => tick + 1), [])

  const isSettled =
    !state.isLoading &&
    state.sources !== null &&
    daily.loadedRange === 'all' &&
    !daily.isLoading

  useEffect(() => {
    if (!isSettled || state.sources === null) return
    setJourney(buildJourney({ ...state.sources, dailyTotals: daily.totals }))
    setIsBuilt(true)
  }, [isSettled, state.sources, daily.totals])

  const error = state.error ?? daily.error

  return {
    journey,
    isLoading: !isBuilt && error === null,
    error,
    reload,
  }
}
