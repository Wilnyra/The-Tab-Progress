import { useCallback, useContext } from 'react'
import type { CountProgressValue } from '../model/countProgressContext'
import { useCountTimeProgress } from './useCountTimeProgress'
import { insertProgress, progressContext } from '@/entities/progress'
import { useAuth } from '@/entities/session'
import { formatMinutesToHm } from '@/shared/lib/formatMinutesToHm'
import { useToast } from '@/shared/ui/Toast'

const SECONDS_PER_MINUTE = 60
const SAVE_ERROR_TOAST_MS = 10000

const formatSavedDuration = (seconds: number): string =>
  seconds < SECONDS_PER_MINUTE
    ? `${seconds}s`
    : formatMinutesToHm(seconds / SECONDS_PER_MINUTE)

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
  const { setProgressReload } = useContext(progressContext)
  const { showToast } = useToast()

  const saveSession = useCallback(
    (durationSeconds: number, comment: string): void => {
      const duration = formatSavedDuration(durationSeconds)
      const attempt = async (): Promise<void> => {
        try {
          const { error } = await insertProgress(
            durationSeconds,
            userId,
            comment,
          )
          if (error) throw new Error(error.message)
          setProgressReload((prev) => prev + 1)
          showToast({ message: `Saved ${duration}` })
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('insertProgress failed', error)
          }
          showToast({
            message: `Couldn't save your ${duration} session.`,
            variant: 'error',
            duration: SAVE_ERROR_TOAST_MS,
            action: {
              label: 'Retry',
              onClick: () => {
                void attempt()
              },
            },
          })
        }
      }
      void attempt()
    },
    [userId, setProgressReload, showToast],
  )

  const startCount = useCallback(
    (initialComment?: string): void => {
      startCountTime(initialComment)
    },
    [startCountTime],
  )

  const stopCount = useCallback((): void => {
    if (!isCounting) return
    const finalDuration = count
    const finalComment = description
    stopCountTime()
    saveSession(finalDuration, finalComment)
  }, [isCounting, count, description, stopCountTime, saveSession])

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
