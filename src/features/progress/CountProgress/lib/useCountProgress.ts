import { useState, useContext, useCallback } from 'react'
import { useCountTimeProgress } from '../lib/useCountTimeProgress'
import {
  progressContext,
  updateProgress,
  insertProgress,
} from '@/entities/progress'
import { useAuth } from '@/entities/session'
import { checkTodayDate } from '@/shared/lib/checkTodayDate'

export const useCountProgress = () => {
  const { session } = useAuth()
  const { count, startCountTime, stopCountTime } = useCountTimeProgress()
  const { lastProgress, setProgressReload } = useContext(progressContext)
  const [isCounting, setIsCounting] = useState(false)

  const handleProgressUpdate = async (currentMinutes: number) => {
    if (checkTodayDate(lastProgress?.created_at)) {
      await updateProgress(lastProgress?.id || '', {
        value: currentMinutes + (lastProgress?.value || 0),
      })
    } else {
      await insertProgress(currentMinutes, session?.user.id || '')
    }
    setProgressReload((prev) => !prev)
  }

  const toggleCount = useCallback(async () => {
    if (isCounting) {
      stopCountTime()
      const currentProgressMinutes = Math.floor(count / 60)
      await handleProgressUpdate(currentProgressMinutes)
    } else {
      startCountTime()
    }
    setIsCounting((prev) => !prev)
  }, [isCounting, count, startCountTime, stopCountTime, handleProgressUpdate])

  return { count, isCounting, toggleCount }
}
