import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { rpcMapClaim } from '../api/rpcMapClaim'
import { rpcMapOpen } from '../api/rpcMapOpen'
import { rpcMapUndo } from '../api/rpcMapUndo'
import type { MapActionResult, MapState } from '../model/types'
import { generateTerrain } from './generateTerrain'
import { mapErrorMessage } from './mapErrorMessage'
import { progressContext } from '@/entities/progress'
import { useAuth } from '@/entities/session'

export type UseTerritoryMapResult = {
  state: MapState | null
  isLoading: boolean
  error: string | null
  // Counts only the refetches caused by new progress (`progressReload`), so a
  // consumer can tell "the server gave us more credits" from a claim or undo.
  refetchCount: number
  claim: (x: number, y: number) => Promise<MapActionResult>
  undo: (eventId: number) => Promise<MapActionResult>
  reload: () => void
}

const noop = (): void => undefined

export const useTerritoryMap = (): UseTerritoryMapResult => {
  const { session } = useAuth()
  const { progressReload } = useContext(progressContext)
  const userId = session?.user.id ?? null

  const [state, setState] = useState<MapState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [refetchCount, setRefetchCount] = useState(0)

  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, [])

  const mountedRef = useRef(true)
  const requestIdRef = useRef(0)
  const hasStateRef = useRef(false)
  // The `progressReload` value behind the state we are currently showing.
  // Recorded on apply, never in the effect body: StrictMode runs the effect
  // twice and the first run is aborted, so a body-level write would swallow
  // the signal before any response could use it.
  const appliedReloadRef = useRef<number | null>(null)
  const queueRef = useRef<Promise<unknown>>(Promise.resolve())

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const applyState = useCallback((next: MapState): void => {
    hasStateRef.current = true
    requestIdRef.current += 1
    if (!mountedRef.current) return
    setState(next)
    setError(null)
  }, [])

  useEffect(() => {
    if (!userId) return

    const controller = new AbortController()
    requestIdRef.current += 1
    const requestId = requestIdRef.current
    // Dropped: the effect was cleaned up or the component unmounted.
    const isDropped = (): boolean =>
      controller.signal.aborted || !mountedRef.current
    // Stale: a newer request (or a claim/undo) already produced fresher state.
    const isStale = (): boolean =>
      isDropped() || requestIdRef.current !== requestId

    // A background refetch: we already hold state and new progress arrived.
    // The initial load, a retry and a claim/undo are all excluded.
    const isRefetch =
      hasStateRef.current && appliedReloadRef.current !== progressReload

    setIsLoading(true)

    let terrain: string | null = null
    try {
      terrain = hasStateRef.current ? null : generateTerrain(userId)
    } catch (cause: unknown) {
      setError(mapErrorMessage(cause))
      setIsLoading(false)
      return
    }

    rpcMapOpen(tz, terrain, controller.signal)
      .then((next) => {
        if (isStale()) return
        hasStateRef.current = true
        appliedReloadRef.current = progressReload
        setState(next)
        setError(null)
        // Batched with `setState`, so a consumer only ever observes the bump
        // together with the state it belongs to.
        if (isRefetch) setRefetchCount((current) => current + 1)
      })
      .catch((cause: unknown) => {
        if (isStale()) return
        setError(mapErrorMessage(cause))
      })
      .finally(() => {
        if (isDropped()) return
        setIsLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [userId, tz, progressReload, reloadKey])

  const runExclusive = useCallback(
    (task: () => Promise<MapActionResult>): Promise<MapActionResult> => {
      const next = queueRef.current.then(task, task)
      queueRef.current = next.then(noop, noop)
      return next
    },
    [],
  )

  const claim = useCallback(
    (x: number, y: number): Promise<MapActionResult> =>
      runExclusive(async () => {
        try {
          const next = await rpcMapClaim(tz, x, y)
          applyState(next)
          return { ok: true, state: next }
        } catch (cause: unknown) {
          return { ok: false, message: mapErrorMessage(cause) }
        }
      }),
    [runExclusive, applyState, tz],
  )

  const undo = useCallback(
    (eventId: number): Promise<MapActionResult> =>
      runExclusive(async () => {
        try {
          const next = await rpcMapUndo(tz, eventId)
          applyState(next)
          return { ok: true, state: next }
        } catch (cause: unknown) {
          return { ok: false, message: mapErrorMessage(cause) }
        }
      }),
    [runExclusive, applyState, tz],
  )

  const reload = useCallback((): void => {
    setReloadKey((current) => current + 1)
  }, [])

  return useMemo(
    () => ({ state, isLoading, error, refetchCount, claim, undo, reload }),
    [state, isLoading, error, refetchCount, claim, undo, reload],
  )
}
