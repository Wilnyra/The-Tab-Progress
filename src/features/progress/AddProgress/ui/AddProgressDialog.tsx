import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  type AddProgressFormSchema,
  addProgressFormSchema,
} from '../model/addProgressFormSchema'
import { ProgressEntryFields } from './ProgressEntryFields'
import {
  createProgressOutboxItem,
  enqueueProgressOutboxItem,
  requestProgressOutboxFlush,
} from '@/entities/progress'
import { useAuth } from '@/entities/session/lib/useAuth'
import { createUuid } from '@/shared/lib/createUuid'
import { Button, buttonVariants } from '@/shared/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/Dialog'
import { Form, FormMessage } from '@/shared/ui/Form'

const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60

const DEFAULT_VALUES: AddProgressFormSchema = {
  hours: 0,
  minutes: 0,
  comment: '',
}

export const AddProgressDialog = (): JSX.Element => {
  const { session } = useAuth()
  const [open, setOpen] = useState(false)
  const clientIdRef = useRef<string | null>(null)

  const formContext = useForm<AddProgressFormSchema>({
    resolver: zodResolver(addProgressFormSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const handleOpenChange = (next: boolean): void => {
    if (next) clientIdRef.current = null
    setOpen(next)
  }

  const handleSubmit = ({
    hours,
    minutes,
    comment,
  }: AddProgressFormSchema): void => {
    const userId = session?.user.id
    if (!userId) {
      formContext.setError('root.serverError', {
        message: "Couldn't add progress. You're signed out.",
      })
      return
    }
    const clientId = clientIdRef.current ?? createUuid()
    clientIdRef.current = clientId
    const totalMinutes = hours * MINUTES_PER_HOUR + minutes
    const trimmed = comment?.trim()
    const item = createProgressOutboxItem({
      clientId,
      userId,
      source: 'manual',
      createdAt: new Date().toISOString(),
      durationSeconds: totalMinutes * SECONDS_PER_MINUTE,
      comment: trimmed ? trimmed : null,
    })
    if (!enqueueProgressOutboxItem(item)) {
      formContext.setError('root.serverError', {
        message: "Couldn't add progress. Storage is unavailable.",
      })
      return
    }
    setOpen(false)
    formContext.reset()
    requestProgressOutboxFlush([clientId])
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        onClick={(e) => e.stopPropagation()}
        className={buttonVariants({ variant: 'default' })}
        aria-label="Add progress entry"
      >
        <Plus />
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Add progress</DialogTitle>
          <DialogDescription>Track your progress</DialogDescription>
        </DialogHeader>

        <Form {...formContext}>
          <form onSubmit={formContext.handleSubmit(handleSubmit)}>
            <div className="grid gap-4">
              <ProgressEntryFields autoFocus />

              <FormMessage className="text-destructive text-sm">
                {formContext.formState.errors.root?.serverError?.message}
              </FormMessage>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={formContext.formState.isSubmitting}
                >
                  Add progress
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
