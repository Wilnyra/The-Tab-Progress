import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  type AddProgressFormSchema,
  addProgressFormSchema,
} from '../model/addProgressFormSchema'
import { ProgressEntryFields } from './ProgressEntryFields'
import { insertProgress, progressContext } from '@/entities/progress'
import { useAuth } from '@/entities/session/lib/useAuth'
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

const DEFAULT_VALUES: AddProgressFormSchema = {
  hours: 0,
  minutes: 0,
  comment: '',
}

export const AddProgressDialog = (): JSX.Element => {
  const { session } = useAuth()
  const { setProgressReload } = useContext(progressContext)
  const [open, setOpen] = useState(false)

  const formContext = useForm<AddProgressFormSchema>({
    resolver: zodResolver(addProgressFormSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const handleSubmit = async ({
    hours,
    minutes,
    comment,
  }: AddProgressFormSchema): Promise<void> => {
    const durationSeconds = (hours * 60 + minutes) * 60
    const { error } = await insertProgress(
      durationSeconds,
      session?.user.id || '',
      comment,
    )
    if (error) {
      formContext.setError('root.serverError', {
        message: `Couldn't add progress. ${error.message}`,
      })
      return
    }

    setProgressReload((prev) => prev + 1)
    setOpen(false)
    formContext.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
