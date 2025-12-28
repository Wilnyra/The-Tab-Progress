import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  editPathFormSchema,
  type EditPathFormSchema,
} from '../model/editPathFormSchema'
import { updatePath } from '@/entities/path'
import { Button } from '@/shared/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Dialog'
import { Form, FormTextarea, FormMessage } from '@/shared/ui/Form'

type EditPathDialogProps = {
  pathId: string
  currentStep: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
}

export const EditPathDialog = ({
  pathId,
  currentStep,
  open,
  onOpenChange,
  onComplete,
}: EditPathDialogProps) => {
  const formContext = useForm<EditPathFormSchema>({
    resolver: zodResolver(editPathFormSchema),
    defaultValues: {
      step: currentStep,
    },
  })

  const onSubmit = ({ step }: EditPathFormSchema) => {
    updatePath(pathId, { step }).then(() => {
      onComplete?.()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Achievement</DialogTitle>
          <DialogDescription>
            Update your achievement or milestone.
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
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
