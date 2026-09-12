import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import { useCallback, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { useDeleteProgressEntry } from '../lib/useDeleteProgressEntry'
import {
  type AddProgressFormSchema,
  addProgressFormSchema,
} from '../model/addProgressFormSchema'
import { ProgressEntryFields } from './ProgressEntryFields'
import {
  clearFrozenTotals,
  progressContext,
  updateProgress,
  type ProgressDayEntry,
} from '@/entities/progress'
import { Button } from '@/shared/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Dialog'
import { Form, FormMessage } from '@/shared/ui/Form'

const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60

const toFormValues = (entry: ProgressDayEntry): AddProgressFormSchema => {
  const totalMinutes = Math.max(
    1,
    Math.round(entry.durationSeconds / SECONDS_PER_MINUTE),
  )
  return {
    hours: Math.floor(totalMinutes / MINUTES_PER_HOUR),
    minutes: totalMinutes % MINUTES_PER_HOUR,
    comment: entry.text ?? '',
  }
}

type EditProgressFormProps = {
  entry: ProgressDayEntry
  onClose: () => void
}

const EditProgressForm = ({
  entry,
  onClose,
}: EditProgressFormProps): JSX.Element => {
  const { setProgressReload } = useContext(progressContext)
  const { deleteEntry } = useDeleteProgressEntry()

  const formContext = useForm<AddProgressFormSchema>({
    resolver: zodResolver(addProgressFormSchema),
    defaultValues: toFormValues(entry),
  })
  const { isSubmitting, dirtyFields } = formContext.formState

  const handleSubmit = async ({
    hours,
    minutes,
    comment,
  }: AddProgressFormSchema): Promise<void> => {
    const totalMinutes = hours * MINUTES_PER_HOUR + minutes
    const isDurationChanged = Boolean(dirtyFields.hours || dirtyFields.minutes)
    const note = comment.trim()
    const { error } = await updateProgress(entry.id, {
      comment: note ? note : null,
      ...(isDurationChanged
        ? {
            duration_seconds: totalMinutes * SECONDS_PER_MINUTE,
            value: totalMinutes,
          }
        : {}),
    })
    if (error) {
      formContext.setError('root.serverError', {
        message: `Couldn't save the entry. ${error.message}`,
      })
      return
    }

    clearFrozenTotals()
    setProgressReload((prev) => prev + 1)
    onClose()
  }

  const handleDelete = (): void => {
    deleteEntry(entry.id)
    onClose()
  }

  return (
    <Form {...formContext}>
      <form onSubmit={formContext.handleSubmit(handleSubmit)}>
        <div className="grid gap-4">
          <ProgressEntryFields />

          <FormMessage className="text-destructive text-sm">
            {formContext.formState.errors.root?.serverError?.message}
          </FormMessage>

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 />
              Delete
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Save
            </Button>
          </DialogFooter>
        </div>
      </form>
    </Form>
  )
}

type EditProgressDialogProps = {
  entry: ProgressDayEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const EditProgressDialog = ({
  entry,
  open,
  onOpenChange,
}: EditProgressDialogProps): JSX.Element => {
  const handleClose = useCallback(
    (): void => onOpenChange(false),
    [onOpenChange],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit entry</DialogTitle>
          <DialogDescription>
            Change the time or note, or delete the entry.
          </DialogDescription>
        </DialogHeader>
        {entry ? (
          <EditProgressForm
            key={entry.id}
            entry={entry}
            onClose={handleClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
