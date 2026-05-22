import { useCallback, useContext } from 'react'
import { useCountTimeProgress } from './useCountTimeProgress'
import { insertProgress, progressContext } from '@/entities/progress'
import { useAuth } from '@/entities/session'

export const useCountProgress = () => {
  const { session } = useAuth()
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
  const { setProgressReload } = useContext(progressContext)

  const handleProgressUpdate = useCallback(
    async (durationSeconds: number, comment: string) => {
      const { error } = await insertProgress(
        durationSeconds,
        session?.user.id || '',
        comment,
      )
      if (error) {
        console.error('insertProgress failed', error)
        return
      }
      setProgressReload((prev) => prev + 1)
    },
    [session?.user.id, setProgressReload],
  )

  const startCount = useCallback(
    (initialComment?: string) => {
      startCountTime(initialComment)
    },
    [startCountTime],
  )

  const stopCount = useCallback(async () => {
    const finalDuration = count
    const finalComment = description
    stopCountTime()
    await handleProgressUpdate(finalDuration, finalComment)
  }, [count, description, stopCountTime, handleProgressUpdate])

  const cancelCount = useCallback(() => {
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
