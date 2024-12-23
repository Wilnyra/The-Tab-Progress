import { useEffect, useRef, useState } from 'react'
import { getSecondsFrom } from '@/shared/lib/getSecondsFrom'
import { PROGRESS_START_TIMESTAMP } from '@/entities/progress'

export const useCountTimeProgress = () => {
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
      setCount(
        getSecondsFrom(localStorage.getItem(PROGRESS_START_TIMESTAMP) || ''),
      )
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
