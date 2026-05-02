import { useContext, useCallback } from 'react'
import { useCountTimeProgress } from '../lib/useCountTimeProgress'
import { progressContext, insertProgress } from '@/entities/progress'
import { useAuth } from '@/entities/session'

export const useCountProgress = () => {
  const { session } = useAuth()
  const {
    count,
    startCountTime,
    stopCountTime,
    isCounting,
  } = useCountTimeProgress()
  const { setProgressReload } = useContext(progressContext)

  const handleProgressUpdate = useCallback(
    async (durationSeconds: number) => {
      const { error } = await insertProgress(
        durationSeconds,
        session?.user.id || '',
      )
      if (error) {
        console.error('insertProgress failed', error)
        return
      }
      setProgressReload((prev) => prev + 1)
    },
    [session?.user.id, setProgressReload],
  )

  const toggleCount = useCallback(async () => {
    if (isCounting) {
      stopCountTime()
      await handleProgressUpdate(count)
    } else {
      startCountTime()
    }
  }, [isCounting, count, startCountTime, stopCountTime, handleProgressUpdate])

  return { count, isCounting, toggleCount }
}
