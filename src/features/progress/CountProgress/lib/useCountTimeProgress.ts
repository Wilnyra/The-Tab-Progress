import { useCallback, useEffect, useRef, useState } from 'react'
import {
  PROGRESS_DESCRIPTION,
  PROGRESS_START_TIMESTAMP,
} from '@/entities/progress'
import { formatSecondsToTime } from '@/shared/lib/formatSecondsToTime'
import { getSecondsFrom } from '@/shared/lib/getSecondsFrom'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'

export const useCountTimeProgress = () => {
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
