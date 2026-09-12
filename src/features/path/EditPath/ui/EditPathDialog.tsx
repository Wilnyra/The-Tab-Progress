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

  const handleSubmit = async ({ step }: EditPathFormSchema): Promise<void> => {
    const { error } = await updatePath(pathId, { step })
    if (error) {
      formContext.setError('root.serverError', {
        message: `Couldn't save the milestone. ${error.message}`,
      })
      return
    }
    onComplete?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit milestone</DialogTitle>
          <DialogDescription>
            Update your milestone or achievement.
          </DialogDescription>
        </DialogHeader>

        <Form {...formContext}>
          <form onSubmit={formContext.handleSubmit(handleSubmit)}>
            <div className="grid gap-4">
              <FormTextarea
                name="step"
                label="Milestone"
                placeholder="e.g., Passed technical interview, Completed major project"
              />

              <FormMessage className="text-destructive text-sm">
                {formContext.formState.errors.root?.serverError?.message}
              </FormMessage>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={formContext.formState.isSubmitting}
                >
                  Save
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
