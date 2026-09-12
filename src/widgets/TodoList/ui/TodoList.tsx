import { type CheckedState } from '@radix-ui/react-checkbox'
import { Plus } from 'lucide-react'
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { TodoListSkeleton } from './TodoListSkeleton'
import {
  selectAllTodo,
  type TodoData,
  TodoItem,
  updateTodo,
} from '@/entities/todo'
import { AddTodoInline } from '@/features/todo/AddTodo'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/Card'
import { useToast } from '@/shared/ui/Toast'

const TODO_LIMIT = 30
const COMPLETE_EXIT_DELAY_MS = 600

type TodoListProps = {
  cardProps?: ComponentProps<typeof Card>
}

export const TodoList = ({ cardProps }: TodoListProps): JSX.Element => {
  const { showToast } = useToast()
  const [data, setData] = useState<TodoData[]>([])
  const [completingIds, setCompletingIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadError, setHasLoadError] = useState(false)
  const addInputRef = useRef<HTMLInputElement>(null)
  const isMountedRef = useRef(false)
  const completingRef = useRef(new Set<string>())
  const exitTimersRef = useRef(new Map<string, number>())
  const intentRef = useRef(new Map<string, number>())
  const queueRef = useRef(new Map<string, Promise<string | null>>())

  useEffect(() => {
    let cancelled = false
    selectAllTodo({ limit: TODO_LIMIT })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setHasLoadError(true)
          return
        }
        setData(data ?? [])
      })
      .catch(() => {
        if (!cancelled) setHasLoadError(true)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    const timers = exitTimersRef.current
    return () => {
      isMountedRef.current = false
      timers.forEach((timer) => window.clearTimeout(timer))
      timers.clear()
    }
  }, [])

  const setCompleting = useCallback(
    (id: string, isCompleting: boolean): void => {
      if (isCompleting) completingRef.current.add(id)
      else completingRef.current.delete(id)
      setCompletingIds(new Set(completingRef.current))
    },
    [],
  )

  const cancelExit = useCallback((id: string): void => {
    const timer = exitTimersRef.current.get(id)
    if (timer === undefined) return
    window.clearTimeout(timer)
    exitTimersRef.current.delete(id)
  }, [])

  const removeTodo = useCallback((id: string): void => {
    setData((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const restoreTodo = useCallback((todo: TodoData, index: number): void => {
    setData((prev) =>
      prev.some((item) => item.id === todo.id)
        ? prev
        : [...prev.slice(0, index), todo, ...prev.slice(index)],
    )
  }, [])

  const nextIntent = useCallback((id: string): number => {
    const intent = (intentRef.current.get(id) ?? 0) + 1
    intentRef.current.set(id, intent)
    return intent
  }, [])

  const isStale = useCallback(
    (id: string, intent: number): boolean =>
      !isMountedRef.current || intentRef.current.get(id) !== intent,
    [],
  )

  const enqueueDone = useCallback(
    (id: string, isDone: boolean): Promise<string | null> => {
      const previous = queueRef.current.get(id) ?? Promise.resolve(null)
      const request = previous
        .then(() => updateTodo(id, { is_done: isDone }))
        .then(
          ({ error }) => error?.message ?? null,
          (error: unknown) =>
            error instanceof Error ? error.message : 'Network error',
        )
      queueRef.current.set(id, request)
      return request
    },
    [],
  )

  const handleUndo = useCallback(
    (todo: TodoData, index: number): void => {
      const intent = nextIntent(todo.id)
      cancelExit(todo.id)
      setCompleting(todo.id, false)
      restoreTodo(todo, index)
      void enqueueDone(todo.id, false).then((error) => {
        if (!error || isStale(todo.id, intent)) return
        removeTodo(todo.id)
        showToast({ message: "Couldn't restore the task.", variant: 'error' })
      })
    },
    [
      nextIntent,
      cancelExit,
      setCompleting,
      restoreTodo,
      enqueueDone,
      isStale,
      removeTodo,
      showToast,
    ],
  )

  const handleComplete = useCallback(
    (todo: TodoData, index: number): void => {
      if (completingRef.current.has(todo.id)) return
      const intent = nextIntent(todo.id)
      setCompleting(todo.id, true)
      exitTimersRef.current.set(
        todo.id,
        window.setTimeout(() => {
          exitTimersRef.current.delete(todo.id)
          setCompleting(todo.id, false)
          removeTodo(todo.id)
        }, COMPLETE_EXIT_DELAY_MS),
      )
      showToast({
        message: 'Task completed',
        action: { label: 'Undo', onClick: () => handleUndo(todo, index) },
      })
      void enqueueDone(todo.id, true).then((error) => {
        if (!error || isStale(todo.id, intent)) return
        cancelExit(todo.id)
        setCompleting(todo.id, false)
        restoreTodo(todo, index)
        showToast({
          message: "Couldn't complete the task. Try again.",
          variant: 'error',
        })
      })
    },
    [
      nextIntent,
      setCompleting,
      removeTodo,
      showToast,
      handleUndo,
      enqueueDone,
      isStale,
      cancelExit,
      restoreTodo,
    ],
  )

  const handleCheckedChange = useCallback(
    (todo: TodoData, index: number, checked: CheckedState): void => {
      if (checked === true) handleComplete(todo, index)
    },
    [handleComplete],
  )

  const handleAdded = useCallback((todo: TodoData): void => {
    setData((prev) => [...prev, todo])
  }, [])

  const handleAddClick = useCallback((): void => {
    addInputRef.current?.focus()
  }, [])

  if (isLoading) {
    return <TodoListSkeleton cardProps={cardProps} />
  }

  return (
    <Card {...cardProps} className={cn('min-h-[280px]', cardProps?.className)}>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="space-y-1.5">
          <CardTitle>Todo</CardTitle>
          <CardDescription>
            These tasks will bring you to your aim
          </CardDescription>
        </div>

        <Button type="button" onClick={handleAddClick} aria-label="Add task">
          <Plus />
        </Button>
      </CardHeader>

      <CardContent>
        {hasLoadError ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Couldn&apos;t load tasks. Try reloading the page.
          </p>
        ) : (
          <>
            {data.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No tasks yet. Add your first one below.
              </p>
            ) : (
              <div className="flex space-y-3 flex-col">
                {data.map((todo, index) => (
                  <TodoItem
                    id={todo.id}
                    key={todo.id}
                    task={todo.task}
                    checked={completingIds.has(todo.id)}
                    onCheckedChange={(checked) =>
                      handleCheckedChange(todo, index, checked)
                    }
                  />
                ))}
              </div>
            )}
            <AddTodoInline ref={addInputRef} onAdded={handleAdded} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
