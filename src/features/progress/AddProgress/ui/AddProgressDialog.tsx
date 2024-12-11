import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  type AddProgressFormSchema,
  addProgressFormSchema,
} from '../model/addProgressFormSchema'
import { insertProgress } from '@/entities/progress'
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
import { FormInput, FormMessage } from '@/shared/ui/Form'
import { Form } from '@/shared/ui/Form'

type AddProgressDialogProps = {
  onComplete?: () => void
}

export const AddProgressDialog = ({ onComplete }: AddProgressDialogProps) => {
  const { session } = useAuth()
  const [open, setOpen] = useState(false)

  const formContext = useForm<AddProgressFormSchema>({
    resolver: zodResolver(addProgressFormSchema),
    defaultValues: {
      value: '',
    },
  })

  const onSubmit = (data: AddProgressFormSchema) => {
    insertProgress(parseInt(data.value), session?.user.id || '').then(() => {
      setOpen(false)
      onComplete?.()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        onClick={(e) => e.stopPropagation()}
        className={buttonVariants({ variant: 'default' })}
      >
        Add
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
