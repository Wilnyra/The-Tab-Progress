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
import { ALLOWED_IMAGE_HOSTS } from '@/shared/lib/allowedImageHosts'
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
        aria-label="Add new photo"
      >
        <Plus />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new Photo</DialogTitle>
          <DialogDescription>
            Inspire to achieve your goals. Only HTTPS images from trusted
            sources are allowed.
          </DialogDescription>
        </DialogHeader>

        <Form {...formContext}>
          <form onSubmit={formContext.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormInput
                name="url"
                label="Photo URL"
                placeholder="https://i.imgur.com/example.jpg"
              />

              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">Allowed sources:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {ALLOWED_IMAGE_HOSTS.filter(
                    (host) => host.description !== undefined,
                  ).map((host) => (
                    <li key={host.domain}>
                      <span className="font-mono text-xs">
                        {host.displayName}
                      </span>
                      {host.description ? ` - ${host.description}` : ''}
                    </li>
                  ))}
                </ul>
              </div>

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
