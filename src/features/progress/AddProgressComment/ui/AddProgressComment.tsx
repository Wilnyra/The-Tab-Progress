import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { progressContext, updateProgress } from '@/entities/progress'
import { Button } from '@/shared/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/Dialog'
import { FormMessage, FormTextarea } from '@/shared/ui/Form'
import { Form } from '@/shared/ui/Form'
import { checkTodayDate } from '@/shared/lib/checkTodayDate'
import {
  AddProgressCommentFormSchema,
  addProgressCommentFormSchema,
} from '../model/addProgressCommentFormSchema'

type AddProgressCommentDialogProps = {
  onComplete?: () => void
}

export const AddProgressCommentDialog = ({
  onComplete,
}: AddProgressCommentDialogProps) => {
  const { progress } = useContext(progressContext)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const formContext = useForm<AddProgressCommentFormSchema>({
    resolver: zodResolver(addProgressCommentFormSchema),
    defaultValues: {
      value: "Today's win:\n\nWhat could be better:\n\nBetter than yesterday:",
    },
  })

  const onSubmit = async (data: AddProgressCommentFormSchema) => {
    setLoading(true)
    try {
      const lastProgress = progress.at(-1)
      if (checkTodayDate(lastProgress?.created_at)) {
        await updateProgress(lastProgress?.id ?? '', { comment: data.value })
      }
      onComplete?.()
      setOpen(false)
      formContext.reset()
    } catch (err) {
      formContext.setError('root.serverError', {
        message: 'Failed to save comment',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" onClick={(e) => e.stopPropagation()}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Today’s Progress Note</DialogTitle>
          <DialogDescription>
            Take a moment to reflect on your day. Writing down even small wins
            helps you stay consistent and motivated. You can use these prompts
            as a guide:
            <br />
            <br />
            1. What went well in today’s progress? <br />
            2. What didn’t go as planned or could be improved? <br />
            3. What did I do better than yesterday?
          </DialogDescription>
        </DialogHeader>

        <Form {...formContext}>
          <form
            onSubmit={formContext.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormTextarea
              name="value"
              label="Comment"
              className="min-h-[160px]"
            />
            <FormMessage>
              {formContext.formState.errors.root?.serverError?.message}
            </FormMessage>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Confirm'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
