import { useCallback, useMemo, useSyncExternalStore } from 'react'
import {
  getProgressOutboxSnapshot,
  subscribeProgressOutbox,
  type ProgressOutboxItem,
} from './progressOutbox'
import { useAuth } from '@/entities/session'

export type UseProgressOutboxResult = {
  pending: ProgressOutboxItem[]
  waiting: ProgressOutboxItem[]
  failed: ProgressOutboxItem[]
  pendingSeconds: number
}

const subscribeOnline = (listener: () => void): (() => void) => {
  window.addEventListener('online', listener)
  window.addEventListener('offline', listener)
  return () => {
    window.removeEventListener('online', listener)
    window.removeEventListener('offline', listener)
  }
}

const getOnlineSnapshot = (): boolean => navigator.onLine !== false

export const useProgressOutbox = (): UseProgressOutboxResult => {
  const { session } = useAuth()
  const userId = session?.user.id ?? ''
  const getSnapshot = useCallback(
    (): readonly ProgressOutboxItem[] => getProgressOutboxSnapshot(userId),
    [userId],
  )
  const items = useSyncExternalStore(subscribeProgressOutbox, getSnapshot)
  const isOnline = useSyncExternalStore(subscribeOnline, getOnlineSnapshot)

  return useMemo(() => {
    const pending = items.filter((item) => item.status === 'pending')
    const waiting = pending.filter(
      (item) => item.attempts > 0 || item.lastError !== null || !isOnline,
    )
    const failed = items.filter((item) => item.status === 'failed')
    const pendingSeconds = pending.reduce(
      (sum, item) => sum + item.durationSeconds,
      0,
    )
    return { pending, waiting, failed, pendingSeconds }
  }, [items, isOnline])
}
