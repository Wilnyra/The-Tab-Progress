import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  addPhotoFormSchema,
  AddPhotoFormSchema,
} from '../model/addPhotoFormSchema'
import { insertPhoto } from '@/entities/photos'
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

type AddPhotoDialogProps = {
  onComplete?: () => void
}

export const AddPhotoDialog = ({ onComplete }: AddPhotoDialogProps) => {
  const { session } = useAuth()
  const [open, setOpen] = useState(false)

  const formContext = useForm<AddPhotoFormSchema>({
    resolver: zodResolver(addPhotoFormSchema),
    defaultValues: {
      url: '',
    },
  })

  const onSubmit = ({ url }: AddPhotoFormSchema) => {
    insertPhoto(url, session?.user.id || '').then(() => {
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
      >
        <Plus />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new Photo</DialogTitle>
          <DialogDescription>Inspire to achieve your goals</DialogDescription>
        </DialogHeader>

        <Form {...formContext}>
          <form onSubmit={formContext.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormInput name="url" />

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
