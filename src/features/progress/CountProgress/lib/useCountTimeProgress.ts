import { useCallback, useEffect, useRef, useState } from 'react'
import {
  PROGRESS_DESCRIPTION,
  PROGRESS_SESSION_ID,
  PROGRESS_START_TIMESTAMP,
} from '@/entities/progress'
import { createUuid } from '@/shared/lib/createUuid'
import { formatSecondsToTime } from '@/shared/lib/formatSecondsToTime'
import { getSecondsFrom } from '@/shared/lib/getSecondsFrom'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'

export type RunningSession = {
  startedAtMs: number | null
  description: string
  sessionId: string | null
}

export type UseCountTimeProgressResult = {
  count: number
  description: string
  setDescription: (next: string) => void
  startedAt: Date | null
  startCountTime: (initialComment?: string) => void
  stopCountTime: () => void
  cancelCountTime: () => void
  isCounting: boolean
}

export const readRunningSession = (): RunningSession | null => {
  const startTimestamp = localStorage.getItem(PROGRESS_START_TIMESTAMP)
  if (!startTimestamp) return null
  const parsedMs = new Date(startTimestamp).getTime()
  return {
    startedAtMs: Number.isNaN(parsedMs) ? null : parsedMs,
    description: localStorage.getItem(PROGRESS_DESCRIPTION) ?? '',
    sessionId: localStorage.getItem(PROGRESS_SESSION_ID),
  }
}

export const useCountTimeProgress = (): UseCountTimeProgressResult => {
  const updateTitle = useDocumentTitle()
  const intervalRef = useRef<number | null>(null)
  const initialTimestamp = localStorage.getItem(PROGRESS_START_TIMESTAMP)
  const initialDescription = localStorage.getItem(PROGRESS_DESCRIPTION) ?? ''

  const [isCounting, setIsCounting] = useState(Boolean(initialTimestamp))
  const [count, setCount] = useState(getSecondsFrom(initialTimestamp || ''))
  const [description, setDescriptionState] = useState(initialDescription)
  const [startedAt, setStartedAt] = useState<Date | null>(
    initialTimestamp ? new Date(initialTimestamp) : null,
  )

  const clearIntervalRef = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const countFn = () => {
    clearIntervalRef()

    intervalRef.current = window.setInterval(() => {
      const seconds = getSecondsFrom(
        localStorage.getItem(PROGRESS_START_TIMESTAMP) || '',
      )

      setCount(seconds)
      updateTitle(formatSecondsToTime(seconds))
    }, 1000)
  }

  const setDescription = useCallback((next: string) => {
    setDescriptionState(next)
    if (next) localStorage.setItem(PROGRESS_DESCRIPTION, next)
    else localStorage.removeItem(PROGRESS_DESCRIPTION)
  }, [])

  const startCountTime = (initialComment?: string) => {
    const now = new Date()
    setCount(0)
    localStorage.setItem(PROGRESS_SESSION_ID, createUuid())
    localStorage.setItem(PROGRESS_START_TIMESTAMP, String(now))
    setStartedAt(now)
    if (initialComment && initialComment.trim()) {
      const trimmed = initialComment.trim()
      setDescriptionState(trimmed)
      localStorage.setItem(PROGRESS_DESCRIPTION, trimmed)
    } else {
      setDescriptionState('')
      localStorage.removeItem(PROGRESS_DESCRIPTION)
    }
    setIsCounting(true)

    countFn()
  }

  const stopCountTime = () => {
    localStorage.removeItem(PROGRESS_START_TIMESTAMP)
    localStorage.removeItem(PROGRESS_DESCRIPTION)
    localStorage.removeItem(PROGRESS_SESSION_ID)
    setIsCounting(false)
    setDescriptionState('')
    setStartedAt(null)

    clearIntervalRef()
  }

  const cancelCountTime = () => {
    stopCountTime()
    setCount(0)
  }

  useEffect(() => {
    if (isCounting) countFn()

    return () => {
      clearIntervalRef()
    }
  }, [isCounting])

  return {
    count,
    description,
    setDescription,
    startedAt,
    startCountTime,
    stopCountTime,
    cancelCountTime,
    isCounting,
  }
}
