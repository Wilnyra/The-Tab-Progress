import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { Dispatch, FC, PropsWithChildren, SetStateAction } from 'react'
import { selectEventsBetween } from '../api/selectEventsBetween'
import type { ProgressEvent } from './types'

const DAYS_WINDOW = 90

type ContextValue = {
  events: ProgressEvent[]
  eventsLoading: boolean
  eventsError: Error | null
  progressReload: number
  setProgressReload: Dispatch<SetStateAction<number>>
  setEventHidden: (id: string, hidden: boolean) => void
}

export const progressContext = createContext<ContextValue>({
  events: [],
  eventsLoading: false,
  eventsError: null,
  progressReload: 0,
  setProgressReload: () => null,
  setEventHidden: () => undefined,
})

const pruneHiddenIds = (
  hiddenIds: ReadonlySet<string>,
  events: ProgressEvent[],
): ReadonlySet<string> => {
  if (hiddenIds.size === 0) return hiddenIds
  const present = new Set(events.map((event) => event.id))
  const next = new Set([...hiddenIds].filter((id) => present.has(id)))
  return next.size === hiddenIds.size ? hiddenIds : next
}

export const ProgressContextProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [rawEvents, setRawEvents] = useState<ProgressEvent[]>([])
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
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
          setRawEvents([])
        } else {
          setRawEvents(data)
          setHiddenIds((prev) => pruneHiddenIds(prev, data))
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

  const setEventHidden = useCallback((id: string, hidden: boolean): void => {
    setHiddenIds((prev) => {
      if (prev.has(id) === hidden) return prev
      const next = new Set(prev)
      if (hidden) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const events = useMemo(
    () =>
      hiddenIds.size === 0
        ? rawEvents
        : rawEvents.filter((event) => !hiddenIds.has(event.id)),
    [rawEvents, hiddenIds],
  )

  const value = useMemo(
    () => ({
      events,
      eventsLoading,
      eventsError,
      progressReload,
      setProgressReload,
      setEventHidden,
    }),
    [events, eventsLoading, eventsError, progressReload, setEventHidden],
  )

  return (
    <progressContext.Provider value={value}>
      {children}
    </progressContext.Provider>
  )
}
