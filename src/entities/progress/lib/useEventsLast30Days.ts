import { useContext } from 'react'
import { progressContext } from '../model/ProgressContext'

export const useEventsLast30Days = () => {
  const { events, eventsLoading, eventsError } = useContext(progressContext)
  return { events, isLoading: eventsLoading, error: eventsError }
}
