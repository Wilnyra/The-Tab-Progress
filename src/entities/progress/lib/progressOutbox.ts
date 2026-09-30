import type { InsertErrorInfo } from './classifyInsertError'
import { PROGRESS_OUTBOX_PREFIX } from './constants'

export type ProgressOutboxSource = 'timer' | 'manual'
export type ProgressOutboxStatus = 'pending' | 'failed'

export type ProgressOutboxItem = {
  v: 1
  clientId: string
  userId: string
  source: ProgressOutboxSource
  createdAt: string
  durationSeconds: number
  comment: string | null
  attempts: number
  nextAttemptAt: number
  status: ProgressOutboxStatus
  lastError: InsertErrorInfo | null
}

export type NewProgressOutboxItem = Pick<
  ProgressOutboxItem,
  'clientId' | 'userId' | 'source' | 'createdAt' | 'durationSeconds' | 'comment'
>

export type ProgressOutboxChangeOrigin = 'local' | 'external'

type Listener = (origin: ProgressOutboxChangeOrigin) => void
type FlushRequestListener = (clientIds: readonly string[]) => void

const FLUSH_REQUEST_EVENT = 'progress-outbox:flush-request'
const EMPTY_ITEMS: readonly ProgressOutboxItem[] = Object.freeze([])

const listeners = new Set<Listener>()
const snapshotCache = new Map<
  string,
  { version: number; items: readonly ProgressOutboxItem[] }
>()
let version = 0

const outboxKeyPrefix = (userId: string): string =>
  `${PROGRESS_OUTBOX_PREFIX}:${userId}:`

const outboxKey = (userId: string, clientId: string): string =>
  `${outboxKeyPrefix(userId)}${clientId}`

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNonNegativeFinite = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0

const parseError = (value: unknown): InsertErrorInfo | null | undefined => {
  if (value === null) return null
  if (
    isRecord(value) &&
    typeof value.status === 'number' &&
    typeof value.code === 'string' &&
    typeof value.message === 'string'
  ) {
    return { status: value.status, code: value.code, message: value.message }
  }
  return undefined
}

const parseItem = (
  raw: string,
  userId: string,
  clientId: string,
): ProgressOutboxItem | null => {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!isRecord(parsed)) return null
  const { source, status, createdAt, comment } = parsed
  const lastError = parseError(parsed.lastError)
  if (
    parsed.v !== 1 ||
    parsed.clientId !== clientId ||
    parsed.userId !== userId ||
    (source !== 'timer' && source !== 'manual') ||
    (status !== 'pending' && status !== 'failed') ||
    typeof createdAt !== 'string' ||
    Number.isNaN(Date.parse(createdAt)) ||
    !isNonNegativeFinite(parsed.durationSeconds) ||
    (comment !== null && typeof comment !== 'string') ||
    !isNonNegativeFinite(parsed.attempts) ||
    !isNonNegativeFinite(parsed.nextAttemptAt) ||
    lastError === undefined
  ) {
    return null
  }
  return {
    v: 1,
    clientId,
    userId,
    source,
    createdAt,
    durationSeconds: Math.floor(parsed.durationSeconds),
    comment,
    attempts: parsed.attempts,
    nextAttemptAt: parsed.nextAttemptAt,
    status,
    lastError,
  }
}

const warnMalformed = (key: string): void => {
  if (import.meta.env.DEV) {
    console.warn('Skipping malformed progress outbox entry', key)
  }
}

const notify = (origin: ProgressOutboxChangeOrigin = 'local'): void => {
  version += 1
  listeners.forEach((listener) => listener(origin))
}

const handleStorage = (event: StorageEvent): void => {
  if (event.key === null || event.key.startsWith(PROGRESS_OUTBOX_PREFIX)) {
    notify('external')
  }
}

const compareOldestFirst = (
  a: ProgressOutboxItem,
  b: ProgressOutboxItem,
): number =>
  Date.parse(a.createdAt) - Date.parse(b.createdAt) ||
  a.clientId.localeCompare(b.clientId)

export const createProgressOutboxItem = (
  item: NewProgressOutboxItem,
): ProgressOutboxItem => ({
  ...item,
  v: 1,
  attempts: 0,
  nextAttemptAt: 0,
  status: 'pending',
  lastError: null,
})

export const readProgressOutboxItem = (
  userId: string,
  clientId: string,
): ProgressOutboxItem | null => {
  try {
    const key = outboxKey(userId, clientId)
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    const item = parseItem(raw, userId, clientId)
    if (!item) warnMalformed(key)
    return item
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to read progress outbox entry', error)
    }
    return null
  }
}

export const listProgressOutbox = (userId: string): ProgressOutboxItem[] => {
  if (!userId) return []
  const prefix = outboxKeyPrefix(userId)
  const items: ProgressOutboxItem[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(prefix)) continue
      const raw = localStorage.getItem(key)
      if (raw === null) continue
      const item = parseItem(raw, userId, key.slice(prefix.length))
      if (item) items.push(item)
      else warnMalformed(key)
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to list progress outbox', error)
    }
  }
  return items.sort(compareOldestFirst)
}

export const enqueueProgressOutboxItem = (
  item: ProgressOutboxItem,
): boolean => {
  try {
    const key = outboxKey(item.userId, item.clientId)
    if (localStorage.getItem(key) !== null) return true
    localStorage.setItem(key, JSON.stringify(item))
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to enqueue progress outbox entry', error)
    }
    return false
  }
  notify()
  return true
}

export const updateProgressOutboxItem = (item: ProgressOutboxItem): boolean => {
  try {
    const key = outboxKey(item.userId, item.clientId)
    if (localStorage.getItem(key) === null) return false
    localStorage.setItem(key, JSON.stringify(item))
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to update progress outbox entry', error)
    }
    return false
  }
  notify()
  return true
}

export const removeProgressOutboxItem = (
  userId: string,
  clientId: string,
): boolean => {
  try {
    localStorage.removeItem(outboxKey(userId, clientId))
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to remove progress outbox entry', error)
    }
    return false
  }
  notify()
  return true
}

export const subscribeProgressOutbox = (listener: Listener): (() => void) => {
  if (listeners.size === 0) {
    version += 1
    window.addEventListener('storage', handleStorage)
  }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      window.removeEventListener('storage', handleStorage)
    }
  }
}

export const getProgressOutboxSnapshot = (
  userId: string,
): readonly ProgressOutboxItem[] => {
  if (!userId) return EMPTY_ITEMS
  const cached = snapshotCache.get(userId)
  if (cached && cached.version === version) return cached.items
  const items = listProgressOutbox(userId)
  const next = items.length === 0 ? EMPTY_ITEMS : items
  snapshotCache.set(userId, { version, items: next })
  return next
}

export const requestProgressOutboxFlush = (
  clientIds: readonly string[] = [],
): void => {
  window.dispatchEvent(
    new CustomEvent(FLUSH_REQUEST_EVENT, { detail: [...clientIds] }),
  )
}

export const subscribeProgressOutboxFlushRequest = (
  listener: FlushRequestListener,
): (() => void) => {
  const handleRequest = (event: Event): void => {
    const detail: unknown = event instanceof CustomEvent ? event.detail : null
    const clientIds = Array.isArray(detail)
      ? detail.filter((id): id is string => typeof id === 'string')
      : []
    listener(clientIds)
  }
  window.addEventListener(FLUSH_REQUEST_EVENT, handleRequest)
  return () => window.removeEventListener(FLUSH_REQUEST_EVENT, handleRequest)
}
