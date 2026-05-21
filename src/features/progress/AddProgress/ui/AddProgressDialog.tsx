import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  type AddProgressFormSchema,
  addProgressFormSchema,
} from '../model/addProgressFormSchema'
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
import { FormInput, FormMessage } from '@/shared/ui/Form'
import { Form } from '@/shared/ui/Form'

export const AddProgressDialog = () => {
  const { session } = useAuth()
  const { setProgressReload } = useContext(progressContext)
  const [open, setOpen] = useState(false)

  const formContext = useForm<AddProgressFormSchema>({
    resolver: zodResolver(addProgressFormSchema),
    defaultValues: {
      value: '',
    },
  })

  const onSubmit = async (data: AddProgressFormSchema) => {
    const minutes = parseInt(data.value)
    const durationSeconds = minutes * 60
    const { error } = await insertProgress(
      durationSeconds,
      session?.user.id || '',
    )
    if (error) {
      console.error('insertProgress failed', error)
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
      >
        <Plus />
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
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
