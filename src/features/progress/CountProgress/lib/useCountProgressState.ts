import { useCallback, useEffect, useRef } from 'react'
import type { CountProgressValue } from '../model/countProgressContext'
import {
  readRunningSession,
  useCountTimeProgress,
} from './useCountTimeProgress'
import {
  createProgressOutboxItem,
  enqueueProgressOutboxItem,
  formatSessionDuration,
  requestProgressOutboxFlush,
} from '@/entities/progress'
import { useAuth } from '@/entities/session'
import { createUuid } from '@/shared/lib/createUuid'
import { useToast } from '@/shared/ui/Toast'

const MS_PER_SECOND = 1000
const SAVE_ERROR_TOAST_MS = 10000

export const useCountProgressState = (): CountProgressValue => {
  const { session } = useAuth()
  const userId = session?.user.id ?? ''
  const {
    count,
    description,
    setDescription,
    startedAt,
    startCountTime,
    stopCountTime,
    cancelCountTime,
    isCounting,
  } = useCountTimeProgress()
  const { showToast } = useToast()
  const lastFiniteCountRef = useRef(0)

  useEffect(() => {
    if (Number.isFinite(count)) lastFiniteCountRef.current = count
  }, [count])

  const startCount = useCallback(
    (initialComment?: string): void => {
      startCountTime(initialComment)
    },
    [startCountTime],
  )

  const stopCount = useCallback((): void => {
    const running = readRunningSession()
    if (!running) {
      stopCountTime()
      return
    }
    const stopMs = Date.now()
    const durationSeconds =
      running.startedAtMs === null
        ? Math.max(0, Math.floor(lastFiniteCountRef.current))
        : Math.max(
            0,
            Math.floor((stopMs - running.startedAtMs) / MS_PER_SECOND),
          )
    if (running.startedAtMs === null && durationSeconds === 0) {
      showToast({
        message: "Couldn't read the session",
        variant: 'error',
        duration: SAVE_ERROR_TOAST_MS,
      })
      return
    }
    const duration = formatSessionDuration(durationSeconds)
    const showSaveError = (): void => {
      showToast({
        message: `Couldn't save your ${duration} session. Try again.`,
        variant: 'error',
        duration: SAVE_ERROR_TOAST_MS,
      })
    }
    if (!userId) {
      showSaveError()
      return
    }
    const comment = running.description.trim()
    const item = createProgressOutboxItem({
      clientId: running.sessionId ?? createUuid(),
      userId,
      source: 'timer',
      createdAt: new Date(stopMs).toISOString(),
      durationSeconds,
      comment: comment ? comment : null,
    })
    if (!enqueueProgressOutboxItem(item)) {
      showSaveError()
      return
    }
    stopCountTime()
    requestProgressOutboxFlush([item.clientId])
  }, [userId, stopCountTime, showToast])

  const cancelCount = useCallback((): void => {
    cancelCountTime()
  }, [cancelCountTime])

  return {
    count,
    isCounting,
    description,
    setDescription,
    startedAt,
    startCount,
    stopCount,
    cancelCount,
  }
}
