import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  type AddProgressFormSchema,
  addProgressFormSchema,
} from '../model/addProgressFormSchema'
import {
  insertProgress,
  progressContext,
  updateProgress,
} from '@/entities/progress'
import { useAuth } from '@/entities/session/lib/useAuth'
import { checkTodayDate } from '@/shared/lib/checkTodayDate'
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
import { FormInput, FormMessage } from '@/shared/ui/Form'
import { Form } from '@/shared/ui/Form'

type AddProgressDialogProps = {
  onComplete?: () => void
}

export const AddProgressDialog = ({ onComplete }: AddProgressDialogProps) => {
  const { session } = useAuth()
  const { progress } = useContext(progressContext)
  const [open, setOpen] = useState(false)

  const formContext = useForm<AddProgressFormSchema>({
    resolver: zodResolver(addProgressFormSchema),
    defaultValues: {
      value: '',
    },
  })

  const onSubmit = async (data: AddProgressFormSchema) => {
    const currentMinutes = parseInt(data.value)
    const lastProgress = progress.at(-1);
    if (checkTodayDate(lastProgress?.created_at)) {
      await updateProgress(lastProgress?.id || '', {
        value: currentMinutes + (lastProgress?.value || 0),
      })
    } else {
      await insertProgress(currentMinutes, session?.user.id || '')
    }

    setOpen(false)
    onComplete?.()
    formContext.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        onClick={(e) => e.stopPropagation()}
        className={buttonVariants({ variant: 'default' })}
      >
        <Plus />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Progress</DialogTitle>
          <DialogDescription>Track your progress</DialogDescription>
        </DialogHeader>

        <Form {...formContext}>
          <form onSubmit={formContext.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormInput name="value" type="number" />

              <FormMessage className="text-destructive text-sm">
                {formContext.formState.errors.root?.serverError?.message}
              </FormMessage>

              <DialogFooter>
                <Button type="submit">Confirm</Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
