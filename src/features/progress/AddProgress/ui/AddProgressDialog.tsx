import { zodResolver } from '@hookform/resolvers/zod'
import { Clock, Plus } from 'lucide-react'
import { useContext, useState, type FocusEvent } from 'react'
import { useForm } from 'react-hook-form'
import {
  type AddProgressFormSchema,
  addProgressFormSchema,
} from '../model/addProgressFormSchema'
import {
  insertProgress,
  progressContext,
  useRecentDescriptions,
} from '@/entities/progress'
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
import { FormInput, FormMessage, FormTextarea } from '@/shared/ui/Form'
import { Form } from '@/shared/ui/Form'

const RECENT_LIMIT = 3
const RECENT_LABEL_MAX = 32

const truncate = (text: string, max = RECENT_LABEL_MAX): string =>
  text.length <= max ? text : `${text.slice(0, max - 1)}…`

export const AddProgressDialog = () => {
  const { session } = useAuth()
  const { setProgressReload } = useContext(progressContext)
  const [open, setOpen] = useState(false)
  const recents = useRecentDescriptions(RECENT_LIMIT)

  const formContext = useForm<AddProgressFormSchema>({
    resolver: zodResolver(addProgressFormSchema),
    defaultValues: {
      hours: 0,
      minutes: 0,
      comment: '',
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

  const handleRecentPick = (value: string) => {
    formContext.setValue('comment', value, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const onSubmit = async ({
    hours,
    minutes,
    comment,
  }: AddProgressFormSchema) => {
    const durationSeconds = (hours * 60 + minutes) * 60
    const { error } = await insertProgress(
      durationSeconds,
      session?.user.id || '',
      comment,
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
                  enterKeyHint="next"
                  autoComplete="off"
                  onFocus={selectOnFocus}
                  transform={clampToRange(59)}
                />
              </div>
              <p className="text-xs text-muted-foreground">Up to 12h</p>

              <FormTextarea
                name="comment"
                label="Note (optional)"
                placeholder="What did you work on?"
                rows={2}
                maxLength={200}
                enterKeyHint="done"
                autoComplete="off"
              />

              {recents.length > 0 ? (
                <div className="space-y-1.5">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Recent
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recents.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleRecentPick(value)}
                        aria-label={`Use recent note: ${value}`}
                        className="inline-flex items-center gap-1.5 h-7 max-w-full px-2.5 rounded-md text-xs border border-border bg-background text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                      >
                        <Clock className="h-3 w-3 shrink-0" />
                        <span className="truncate">{truncate(value)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

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
