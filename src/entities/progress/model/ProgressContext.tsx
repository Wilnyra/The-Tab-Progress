import { createContext, useEffect, useMemo, useState } from 'react'
import type { Dispatch, FC, PropsWithChildren, SetStateAction } from 'react'
import { selectEventsBetween } from '../api/selectEventsBetween'
import type { ProgressEvent } from './types'

const DAYS_WINDOW = 30

type ContextValue = {
  events: ProgressEvent[]
  eventsLoading: boolean
  eventsError: Error | null
  progressReload: number
  setProgressReload: Dispatch<SetStateAction<number>>
}

export const progressContext = createContext<ContextValue>({
  events: [],
  eventsLoading: false,
  eventsError: null,
  progressReload: 0,
  setProgressReload: () => null,
})

export const ProgressContextProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [events, setEvents] = useState<ProgressEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [eventsError, setEventsError] = useState<Error | null>(null)
  const [progressReload, setProgressReload] = useState(0)

  useEffect(() => {
    let cancelled = false
    setEventsLoading(true)

    const start = new Date()
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - (DAYS_WINDOW - 1))
    const end = new Date()

    selectEventsBetween(start, end)
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setEventsError(error as Error)
          setEvents([])
        } else {
          setEvents(data)
          setEventsError(null)
        }
      })
      .finally(() => {
        if (!cancelled) setEventsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [progressReload])

  const value = useMemo(
    () => ({
      events,
      eventsLoading,
      eventsError,
      progressReload,
      setProgressReload,
    }),
    [events, eventsLoading, eventsError, progressReload],
  )

  return (
    <progressContext.Provider value={value}>
      {children}
    </progressContext.Provider>
  )
}
