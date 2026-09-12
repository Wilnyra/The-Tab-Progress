import { useContext, useMemo } from 'react'
import { progressContext } from '../model/ProgressContext'
import type { ProgressEvent } from '../model/types'
import { filterEventsToLastDays } from './filterEventsToLastDays'

const DAYS = 30

type UseEventsLast30DaysResult = {
  events: ProgressEvent[]
  isLoading: boolean
  error: Error | null
}

export const useEventsLast30Days = (): UseEventsLast30DaysResult => {
  const { events, eventsLoading, eventsError } = useContext(progressContext)
  const recentEvents = useMemo(
    () => filterEventsToLastDays(events, DAYS),
    [events],
  )
  return { events: recentEvents, isLoading: eventsLoading, error: eventsError }
}
