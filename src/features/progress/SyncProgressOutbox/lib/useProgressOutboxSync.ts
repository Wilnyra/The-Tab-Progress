import { useContext, useEffect, useRef } from 'react'
import {
  claimProgressOutboxFlushResult,
  clearFrozenTotals,
  flushProgressOutbox,
  formatSessionDuration,
  getProgressOutboxNextDueDelay,
  listProgressOutbox,
  markProgressOutboxOffline,
  OUTBOX_BACKOFF_BASE_MS,
  progressContext,
  subscribeProgressOutbox,
  subscribeProgressOutboxFlushRequest,
  type FlushProgressOutboxResult,
  type ProgressOutboxChangeOrigin,
  type ProgressOutboxItem,
} from '@/entities/progress'
import { useAuth } from '@/entities/session'
import { supabase } from '@/shared/lib/supabase'
import { useToast, type ToastOptions } from '@/shared/ui/Toast'

const EXTERNAL_RELOAD_DEBOUNCE_MS = 300
const OFFLINE_MESSAGE = 'Saved offline · will sync when online'
const RETRY_MESSAGE = 'Saved · will retry shortly'

const startOfTodayMs = (): number => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

const touchesPastDay = (items: readonly ProgressOutboxItem[]): boolean => {
  const todayMs = startOfTodayMs()
  return items.some((item) => Date.parse(item.createdAt) < todayMs)
}

const isOfflineError = (item: ProgressOutboxItem): boolean =>
  navigator.onLine === false || item.lastError?.status === 0

const describeSynced = (
  synced: readonly ProgressOutboxItem[],
  immediateIds: ReadonlySet<string>,
): string => {
  const [first] = synced
  if (synced.length !== 1 || !first) return `Synced ${synced.length} sessions`
  const duration = formatSessionDuration(first.durationSeconds)
  return immediateIds.has(first.clientId)
    ? `Saved ${duration}`
    : `Synced ${duration} session`
}

const pickToast = (
  result: FlushProgressOutboxResult,
  immediateIds: ReadonlySet<string>,
): ToastOptions | null => {
  const isImmediate = (item: ProgressOutboxItem): boolean =>
    immediateIds.has(item.clientId)
  const failed = result.failed.find(isImmediate)
  if (failed) {
    const duration = formatSessionDuration(failed.durationSeconds)
    return {
      message: `Couldn't save your ${duration} session.`,
      variant: 'error',
    }
  }
  const [deferred] = result.deferred
  if (deferred && result.deferred.some(isImmediate)) {
    return {
      message: isOfflineError(deferred) ? OFFLINE_MESSAGE : RETRY_MESSAGE,
    }
  }
  if (result.synced.length > 0) {
    return { message: describeSynced(result.synced, immediateIds) }
  }
  return null
}

const toItemMap = (
  items: readonly ProgressOutboxItem[],
): Map<string, ProgressOutboxItem> =>
  new Map(items.map((item) => [item.clientId, item]))

export const useProgressOutboxSync = (): void => {
  const { session } = useAuth()
  const userId = session?.user.id ?? ''
  const { setProgressReload } = useContext(progressContext)
  const { showToast } = useToast()
  const immediateIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!userId) return

    let cancelled = false
    const controller = new AbortController()
    const immediateIds = immediateIdsRef.current
    let retryTimer: number | undefined
    let authTimer: number | undefined
    let externalTimer: number | undefined
    let externalPastDay = false
    let hasSession = true
    let known = toItemMap(listProgressOutbox(userId))

    const settleImmediate = (
      result: FlushProgressOutboxResult,
    ): ToastOptions | null => {
      const toast = pickToast(result, immediateIds)
      const settled = [...result.synced, ...result.deferred, ...result.failed]
      settled.forEach((item) => immediateIds.delete(item.clientId))
      const present = new Set(
        listProgressOutbox(userId).map((item) => item.clientId),
      )
      immediateIds.forEach((id) => {
        if (!present.has(id)) immediateIds.delete(id)
      })
      return toast
    }

    const applyResult = (result: FlushProgressOutboxResult): void => {
      if (result.synced.length > 0) {
        if (touchesPastDay(result.synced)) clearFrozenTotals()
        setProgressReload((prev) => prev + 1)
      }
      const toast = settleImmediate(result)
      if (toast) showToast(toast)
    }

    const scheduleRetry = (delay: number | null): void => {
      window.clearTimeout(retryTimer)
      retryTimer = undefined
      if (delay === null || cancelled) return
      retryTimer = window.setTimeout(
        () => {
          void runFlush()
        },
        Math.max(delay, OUTBOX_BACKOFF_BASE_MS),
      )
    }

    const runFlush = async (ignoreBackoff = false): Promise<void> => {
      if (cancelled) return
      if (navigator.onLine === false) {
        scheduleRetry(null)
        markProgressOutboxOffline(userId)
        if (immediateIds.size > 0) {
          immediateIds.clear()
          showToast({ message: OFFLINE_MESSAGE })
        }
        return
      }
      let result: FlushProgressOutboxResult
      try {
        result = await flushProgressOutbox(userId, controller.signal, {
          ignoreBackoff,
        })
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('flushProgressOutbox failed', error)
        }
        if (!cancelled) scheduleRetry(getProgressOutboxNextDueDelay(userId))
        return
      }
      if (cancelled) return
      if (claimProgressOutboxFlushResult(result)) applyResult(result)
      scheduleRetry(
        result.lockBusy
          ? OUTBOX_BACKOFF_BASE_MS
          : getProgressOutboxNextDueDelay(userId),
      )
    }

    const trigger = (): void => {
      void runFlush()
    }

    const forceTrigger = (): void => {
      void runFlush(true)
    }

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') trigger()
    }

    const flushExternalRemoval = (): void => {
      externalTimer = undefined
      if (cancelled) return
      if (externalPastDay) clearFrozenTotals()
      externalPastDay = false
      setProgressReload((prev) => prev + 1)
    }

    const handleOutboxChange = (origin: ProgressOutboxChangeOrigin): void => {
      const next = toItemMap(listProgressOutbox(userId))
      if (origin === 'external') {
        const removed = [...known.values()].filter(
          (item) => !next.has(item.clientId),
        )
        if (removed.length > 0) {
          externalPastDay = externalPastDay || touchesPastDay(removed)
          window.clearTimeout(externalTimer)
          externalTimer = window.setTimeout(
            flushExternalRemoval,
            EXTERNAL_RELOAD_DEBOUNCE_MS,
          )
        }
      }
      known = next
    }

    const unsubscribeOutbox = subscribeProgressOutbox(handleOutboxChange)
    const unsubscribeRequests = subscribeProgressOutboxFlushRequest(
      (clientIds) => {
        clientIds.forEach((id) => immediateIds.add(id))
        trigger()
      },
    )
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      const shouldForce =
        event === 'TOKEN_REFRESHED' || (event === 'SIGNED_IN' && !hasSession)
      hasSession = nextSession !== null
      if (!shouldForce) return
      window.clearTimeout(authTimer)
      authTimer = window.setTimeout(forceTrigger, 0)
    })
    window.addEventListener('online', forceTrigger)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    forceTrigger()

    return () => {
      cancelled = true
      controller.abort()
      window.clearTimeout(retryTimer)
      window.clearTimeout(authTimer)
      window.clearTimeout(externalTimer)
      unsubscribeOutbox()
      unsubscribeRequests()
      subscription.unsubscribe()
      window.removeEventListener('online', forceTrigger)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [userId, setProgressReload, showToast])
}
