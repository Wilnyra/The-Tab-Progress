import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  addPathFormSchema,
  type AddPathFormSchema,
} from '../model/addPathFormSchema'
import { useAuth } from '@/entities/session/lib/useAuth'
import { insertPath } from '@/entities/path'
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
import { Form, FormTextarea, FormMessage } from '@/shared/ui/Form'

type AddPathDialogProps = {
  onComplete?: () => void
}

export const AddPathDialog = ({ onComplete }: AddPathDialogProps) => {
  const { session } = useAuth()
  const [open, setOpen] = useState(false)

  const formContext = useForm<AddPathFormSchema>({
    resolver: zodResolver(addPathFormSchema),
    defaultValues: {
      step: '',
    },
  })

  const onSubmit = ({ step }: AddPathFormSchema) => {
    insertPath(step, session?.user.id || '').then(() => {
      setOpen(false)
      onComplete?.()
      formContext.reset()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        onClick={(e) => e.stopPropagation()}
        className={buttonVariants({ variant: 'default' })}
        aria-label="Add new achievement"
      >
        <Plus />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Achievement</DialogTitle>
          <DialogDescription>
            Record a milestone or achievement in your journey.
          </DialogDescription>
        </DialogHeader>

        <Form {...formContext}>
          <form onSubmit={formContext.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormTextarea
                name="step"
                label="Achievement"
                placeholder="e.g., Passed technical interview, Completed major project"
              />

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
