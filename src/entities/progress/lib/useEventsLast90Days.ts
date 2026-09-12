import { useContext } from 'react'
import { progressContext } from '../model/ProgressContext'
import type { ProgressEvent } from '../model/types'

type UseEventsLast90DaysResult = {
  events: ProgressEvent[]
  isLoading: boolean
  error: Error | null
}

export const useEventsLast90Days = (): UseEventsLast90DaysResult => {
  const { events, eventsLoading, eventsError } = useContext(progressContext)
  return { events, isLoading: eventsLoading, error: eventsError }
}
