import { insertProgress } from '../api/insertProgress'
import type { InsertErrorInfo } from './classifyInsertError'
import { PROGRESS_OUTBOX_PREFIX } from './constants'
import { computeOutboxBackoffMs } from './outboxBackoff'
import {
  listProgressOutbox,
  readProgressOutboxItem,
  removeProgressOutboxItem,
  updateProgressOutboxItem,
  type ProgressOutboxItem,
} from './progressOutbox'

export type FlushProgressOutboxResult = {
  synced: ProgressOutboxItem[]
  deferred: ProgressOutboxItem[]
  failed: ProgressOutboxItem[]
  lockBusy: boolean
}

export type FlushProgressOutboxOptions = {
  ignoreBackoff?: boolean
}

type QueuedRun = {
  promise: Promise<FlushProgressOutboxResult>
  options: FlushProgressOutboxOptions
  signal: AbortSignal
  latestSignal: AbortSignal
}

const REQUEST_TIMEOUT_MS = 15000
const OFFLINE_ERROR: InsertErrorInfo = {
  status: 0,
  code: 'offline',
  message: 'offline',
}

const inflight = new Map<string, Promise<FlushProgressOutboxResult>>()
const queued = new Map<string, QueuedRun>()
const memoryBackoff = new Map<string, number>()
const claimedResults = new WeakSet<FlushProgressOutboxResult>()

const memoryKey = (userId: string, clientId: string): string =>
  `${userId}:${clientId}`

const effectiveNextAttemptAt = (item: ProgressOutboxItem): number =>
  Math.max(
    item.nextAttemptAt,
    memoryBackoff.get(memoryKey(item.userId, item.clientId)) ?? 0,
  )

const rememberBackoff = (item: ProgressOutboxItem, until: number): void => {
  memoryBackoff.set(memoryKey(item.userId, item.clientId), until)
}

const forgetBackoff = (item: ProgressOutboxItem): void => {
  memoryBackoff.delete(memoryKey(item.userId, item.clientId))
}

const persistOrRemember = (
  item: ProgressOutboxItem,
  fallbackUntil: number,
): boolean => {
  if (updateProgressOutboxItem(item)) {
    forgetBackoff(item)
    return true
  }
  if (readProgressOutboxItem(item.userId, item.clientId)) {
    rememberBackoff(item, fallbackUntil)
  } else {
    forgetBackoff(item)
  }
  return false
}

const createLockBusyResult = (): FlushProgressOutboxResult => ({
  synced: [],
  deferred: [],
  failed: [],
  lockBusy: true,
})

const createRequestSignal = (
  parent: AbortSignal,
): { signal: AbortSignal; dispose: () => void } => {
  const controller = new AbortController()
  const handleParentAbort = (): void => controller.abort(parent.reason)
  const timer = window.setTimeout(() => {
    controller.abort(new DOMException('Request timed out', 'TimeoutError'))
  }, REQUEST_TIMEOUT_MS)
  if (parent.aborted) handleParentAbort()
  else parent.addEventListener('abort', handleParentAbort, { once: true })
  return {
    signal: controller.signal,
    dispose: () => {
      window.clearTimeout(timer)
      parent.removeEventListener('abort', handleParentAbort)
    },
  }
}

const sendItem = async (
  item: ProgressOutboxItem,
  parent: AbortSignal,
): Promise<Awaited<ReturnType<typeof insertProgress>>> => {
  const request = createRequestSignal(parent)
  try {
    return await insertProgress(
      {
        clientId: item.clientId,
        userId: item.userId,
        createdAt: item.createdAt,
        durationSeconds: item.durationSeconds,
        comment: item.comment,
      },
      request.signal,
    )
  } finally {
    request.dispose()
  }
}

const listDue = (
  userId: string,
  ignoreBackoff: boolean,
): ProgressOutboxItem[] => {
  const now = Date.now()
  return listProgressOutbox(userId).filter(
    (item) =>
      item.status === 'pending' &&
      (ignoreBackoff || effectiveNextAttemptAt(item) <= now),
  )
}

const drainQueue = async (
  userId: string,
  signal: AbortSignal,
  { ignoreBackoff = false }: FlushProgressOutboxOptions,
): Promise<FlushProgressOutboxResult> => {
  const result: FlushProgressOutboxResult = {
    synced: [],
    deferred: [],
    failed: [],
    lockBusy: false,
  }
  const due = listDue(userId, ignoreBackoff)

  for (let index = 0; index < due.length; index++) {
    const candidate = due[index]
    if (!candidate || signal.aborted) break
    const item = readProgressOutboxItem(userId, candidate.clientId)
    if (!item || item.status !== 'pending') continue

    const { kind, error } = await sendItem(item, signal)
    if (signal.aborted) break
    const backoffUntil = Date.now() + computeOutboxBackoffMs(item.attempts + 1)

    if (kind === 'ok') {
      if (removeProgressOutboxItem(userId, item.clientId)) forgetBackoff(item)
      else rememberBackoff(item, backoffUntil)
      result.synced.push(item)
      continue
    }
    if (kind === 'permanent') {
      const failed: ProgressOutboxItem = {
        ...item,
        status: 'failed',
        lastError: error,
      }
      if (persistOrRemember(failed, backoffUntil)) result.failed.push(failed)
      continue
    }
    const deferred: ProgressOutboxItem = {
      ...item,
      attempts: item.attempts + 1,
      nextAttemptAt: backoffUntil,
      lastError: error,
    }
    persistOrRemember(deferred, backoffUntil)
    result.deferred.push(deferred, ...due.slice(index + 1))
    break
  }
  return result
}

const runExclusive = async (
  userId: string,
  signal: AbortSignal,
  options: FlushProgressOutboxOptions,
): Promise<FlushProgressOutboxResult> => {
  const locks: LockManager | undefined = navigator.locks
  if (typeof locks?.request !== 'function') {
    return drainQueue(userId, signal, options)
  }
  return locks.request(
    `${PROGRESS_OUTBOX_PREFIX}:${userId}`,
    { ifAvailable: true },
    (lock) =>
      lock ? drainQueue(userId, signal, options) : createLockBusyResult(),
  )
}

const start = (
  userId: string,
  signal: AbortSignal,
  options: FlushProgressOutboxOptions,
): Promise<FlushProgressOutboxResult> => {
  const run = runExclusive(userId, signal, options).finally(() => {
    if (inflight.get(userId) === run) inflight.delete(userId)
  })
  inflight.set(userId, run)
  return run
}

export const flushProgressOutbox = (
  userId: string,
  signal: AbortSignal,
  options: FlushProgressOutboxOptions = {},
): Promise<FlushProgressOutboxResult> => {
  const pendingRun = queued.get(userId)
  if (pendingRun) {
    if (options.ignoreBackoff) pendingRun.options.ignoreBackoff = true
    pendingRun.latestSignal = signal
    return pendingRun.promise
  }
  const current = inflight.get(userId)
  if (!current) return start(userId, signal, { ...options })

  const promise = current
    .catch(() => undefined)
    .then(() => {
      const run = queued.get(userId)
      queued.delete(userId)
      if (!run) return start(userId, signal, { ...options })
      const runSignal = run.signal.aborted ? run.latestSignal : run.signal
      return start(userId, runSignal, run.options)
    })
  queued.set(userId, {
    promise,
    options: { ...options },
    signal,
    latestSignal: signal,
  })
  return promise
}

export const claimProgressOutboxFlushResult = (
  result: FlushProgressOutboxResult,
): boolean => {
  if (claimedResults.has(result)) return false
  claimedResults.add(result)
  return true
}

export const getProgressOutboxNextDueDelay = (
  userId: string,
): number | null => {
  const now = Date.now()
  const delays = listProgressOutbox(userId)
    .filter((item) => item.status === 'pending')
    .map((item) => Math.max(0, effectiveNextAttemptAt(item) - now))
  return delays.length === 0 ? null : Math.min(...delays)
}

export const markProgressOutboxOffline = (userId: string): void => {
  listDue(userId, false).forEach((item) => {
    if (item.lastError?.code === OFFLINE_ERROR.code) return
    updateProgressOutboxItem({ ...item, lastError: OFFLINE_ERROR })
  })
}
