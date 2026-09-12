import { Plus } from 'lucide-react'
import {
  forwardRef,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { addTodoFormSchema } from '../model/addTodoFormSchema'
import { useAuth } from '@/entities/session'
import { insertTodo, type TodoData } from '@/entities/todo'

const ADD_ERROR = "Couldn't add the task."

type AddTodoInlineProps = {
  onAdded: (todo: TodoData) => void
}

export const AddTodoInline = forwardRef<HTMLInputElement, AddTodoInlineProps>(
  ({ onAdded }, ref) => {
    const { session } = useAuth()
    const errorId = useId()
    const [value, setValue] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const submittingRef = useRef(false)

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
      setValue(e.target.value)
      setError(null)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      setValue('')
      setError(null)
      e.currentTarget.blur()
    }

    const handleBlur = (): void => {
      if (value.trim() !== '') return
      setValue('')
      setError(null)
    }

    const handleSubmit = async (
      e: FormEvent<HTMLFormElement>,
    ): Promise<void> => {
      e.preventDefault()
      const task = value.trim()
      if (task === '' || submittingRef.current) return

      const parsed = addTodoFormSchema.safeParse({ todo: task })
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? ADD_ERROR)
        return
      }
      const userId = session?.user.id
      if (!userId) {
        setError('Your session has expired. Log in again.')
        return
      }

      submittingRef.current = true
      setIsSubmitting(true)
      try {
        const { data, error: insertError } = await insertTodo(
          parsed.data.todo,
          userId,
        )
        if (insertError || !data) {
          setError(`${ADD_ERROR} ${insertError?.message ?? 'Try again.'}`)
          return
        }
        setValue((current) => (current.trim() === task ? '' : current))
        onAdded(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? `${ADD_ERROR} ${err.message}`
            : `${ADD_ERROR} Try again.`,
        )
      } finally {
        submittingRef.current = false
        setIsSubmitting(false)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="mt-1">
        <label className="-mx-2 flex cursor-text items-center gap-3 rounded-md px-2 transition-colors hover:bg-accent/50 focus-within:bg-accent/50 focus-within:ring-1 focus-within:ring-ring">
          <Plus
            className="h-5 w-5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            ref={ref}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="Add task"
            aria-label="Add task"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            aria-busy={isSubmitting}
            enterKeyHint="enter"
            autoComplete="off"
            className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:h-10 md:text-sm"
          />
        </label>
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="mt-1 text-[0.8rem] font-medium text-destructive"
          >
            {error}
          </p>
        ) : null}
      </form>
    )
  },
)
AddTodoInline.displayName = 'AddTodoInline'
