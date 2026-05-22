import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useContext, useState, type FocusEvent } from 'react'
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
      hours: 0,
      minutes: 0,
    },
  })

  const selectOnFocus = (e: FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }

  const clampToRange = (max: number) => (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (digits === '') return ''
    const parsed = parseInt(digits, 10)
    return Math.min(parsed, max)
  }

  const onSubmit = async ({ hours, minutes }: AddProgressFormSchema) => {
    const durationSeconds = (hours * 60 + minutes) * 60
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
        aria-label="Add progress entry"
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
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  name="hours"
                  label="Hours (0–12)"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  autoFocus
                  enterKeyHint="next"
                  autoComplete="off"
                  onFocus={selectOnFocus}
                  transform={clampToRange(12)}
                />
                <FormInput
                  name="minutes"
                  label="Minutes (0–59)"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  enterKeyHint="done"
                  autoComplete="off"
                  onFocus={selectOnFocus}
                  transform={clampToRange(59)}
                />
              </div>
              <p className="text-xs text-muted-foreground">Up to 12h</p>

              <FormMessage className="text-destructive text-sm">
                {formContext.formState.errors.root?.serverError?.message}
              </FormMessage>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={formContext.formState.isSubmitting}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
