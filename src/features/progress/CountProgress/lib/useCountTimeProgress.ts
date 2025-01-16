import { useEffect, useRef, useState } from 'react'
import { getSecondsFrom } from '@/shared/lib/getSecondsFrom'
import { PROGRESS_START_TIMESTAMP } from '@/entities/progress'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'
import { formatSecondsToTime } from '@/shared/lib/formatSecondsToTime'

export const useCountTimeProgress = () => {
  const updateTitle = useDocumentTitle()
  const intervalRef = useRef<number | null>(null)
  const initialTimestamp = localStorage.getItem(PROGRESS_START_TIMESTAMP)

  const [isCounting, setIsCounting] = useState(Boolean(initialTimestamp))
  const [count, setCount] = useState(getSecondsFrom(initialTimestamp || ''))

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

  const startCountTime = () => {
    setCount(0)
    localStorage.setItem(PROGRESS_START_TIMESTAMP, String(new Date()))
    setIsCounting(true)

    countFn()
  }

  const stopCountTime = () => {
    localStorage.removeItem(PROGRESS_START_TIMESTAMP)
    setIsCounting(false)

    clearIntervalRef()
  }

  useEffect(() => {
    if (isCounting) countFn()

    return () => {
      clearIntervalRef()
    }
  }, [isCounting])

  return {
    count,
    startCountTime,
    stopCountTime,
    isCounting,
  }
}
