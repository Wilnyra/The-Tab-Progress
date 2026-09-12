import { useCallback, useContext } from 'react'
import {
  clearFrozenTotals,
  deleteProgress,
  progressContext,
} from '@/entities/progress'
import { useToast } from '@/shared/ui/Toast'

type UseDeleteProgressEntryResult = {
  deleteEntry: (id: string) => void
}

export const useDeleteProgressEntry = (): UseDeleteProgressEntryResult => {
  const { setEventHidden, setProgressReload } = useContext(progressContext)
  const { showToast } = useToast()

  const deleteEntry = useCallback(
    (id: string): void => {
      const restore = (): void => setEventHidden(id, false)

      const commit = async (): Promise<void> => {
        try {
          const { error } = await deleteProgress(id)
          if (error) throw new Error(error.message)
          clearFrozenTotals()
          setProgressReload((prev) => prev + 1)
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('deleteProgress failed', error)
          }
          restore()
          showToast({
            message: "Couldn't delete the entry. It's back in the list.",
            variant: 'error',
          })
        }
      }

      setEventHidden(id, true)
      showToast({
        message: 'Entry deleted',
        action: { label: 'Undo', onClick: restore },
        onDismiss: (reason) => {
          if (reason !== 'action') void commit()
        },
      })
    },
    [setEventHidden, setProgressReload, showToast],
  )

  return { deleteEntry }
}
