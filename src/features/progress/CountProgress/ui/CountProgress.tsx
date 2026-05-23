import {
  CircleStop,
  CirclePlay,
  Clock,
  Pencil,
  Play,
  Sparkles,
  X,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
} from 'react'
import { useCountProgress } from '../lib/useCountProgress'
import { useEventsLast30Days, useRecentDescriptions } from '@/entities/progress'
import { cn } from '@/shared/lib/cn'
import { formatSecondsToTime } from '@/shared/lib/formatSecondsToTime'
import { Button } from '@/shared/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/Card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Dialog'

type CountProgressProps = {
  cardProps?: ComponentProps<typeof Card>
}

const CANCEL_CONFIRM_THRESHOLD_SECONDS = 60

const formatStartedAt = (date: Date | null): string => {
  if (!date) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const truncate = (text: string, max = 32): string =>
  text.length <= max ? text : `${text.slice(0, max - 1)}…`

export const CountProgress = ({ cardProps }: CountProgressProps) => {
  const {
    count,
    isCounting,
    description,
    setDescription,
    startedAt,
    startCount,
    stopCount,
    cancelCount,
  } = useCountProgress()
  const { events } = useEventsLast30Days()
  const recents = useRecentDescriptions(3)

  const [draft, setDraft] = useState(description)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [isEditingRunning, setIsEditingRunning] = useState(false)
  const [editDraft, setEditDraft] = useState(description)
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)

  const editInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isCounting) setDraft('')
  }, [isCounting])

  useEffect(() => {
    if (isEditingRunning) {
      setEditDraft(description)
      editInputRef.current?.focus()
      editInputRef.current?.select()
    }
  }, [isEditingRunning, description])

  const isEmptyState = !isCounting && events.length === 0

  const handleStart = useCallback(() => {
    const trimmed = draft.trim()
    startCount(trimmed)
  }, [draft, startCount])

  const handleStop = useCallback(() => {
    stopCount()
  }, [stopCount])

  const handleCancelClick = useCallback(() => {
    if (description.trim() === '' && count < CANCEL_CONFIRM_THRESHOLD_SECONDS) {
      cancelCount()
      return
    }
    setCancelConfirmOpen(true)
  }, [description, count, cancelCount])

  const confirmDiscard = useCallback(() => {
    cancelCount()
    setCancelConfirmOpen(false)
  }, [cancelCount])

  const handleSuggestionPick = useCallback((value: string) => {
    setDraft(value)
  }, [])

  const handleStartEditing = useCallback(() => {
    setIsEditingRunning(true)
  }, [])

  const handleSaveEditing = useCallback(() => {
    setDescription(editDraft.trim())
    setIsEditingRunning(false)
  }, [editDraft, setDescription])

  const handleCancelEditing = useCallback(() => {
    setEditDraft(description)
    setIsEditingRunning(false)
  }, [description])

  const handleEditKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSaveEditing()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleCancelEditing()
      }
    },
    [handleSaveEditing, handleCancelEditing],
  )

  const handleIdleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleStart()
      }
    },
    [handleStart],
  )

  const showSuggestions =
    !isCounting && draft.trim() === '' && isInputFocused && recents.length > 0

  const cardDescription = isCounting
    ? `Working since ${formatStartedAt(startedAt)}`
    : isEmptyState
      ? 'Start tracking your first session'
      : 'What are you tracking?'

  return (
    <>
      <Card {...cardProps}>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Count Progress</CardTitle>
            <CardDescription>{cardDescription}</CardDescription>
          </div>
          {isCounting ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCancelClick}
              aria-label="Cancel counting progress"
              className="h-8 w-8 -mr-2 -mt-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-4">
          {isCounting ? (
            isEditingRunning ? (
              <div className="flex items-center gap-2">
                <div className="flex flex-1 min-w-0 items-center gap-2 h-10 rounded-md border border-input bg-transparent px-3 shadow-sm focus-within:ring-1 focus-within:ring-ring">
                  <Sparkles className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <input
                    ref={editInputRef}
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    placeholder="What are you working on?"
                    className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    aria-label="Edit session description"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEditing}
                  className="shrink-0"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveEditing}
                  className="shrink-0"
                >
                  Save
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartEditing}
                className="group flex w-full items-center justify-between gap-2 h-10 rounded-md border border-border bg-muted/40 px-3 text-left transition-colors hover:bg-muted/60"
                aria-label="Edit session description"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span
                    className={cn(
                      'truncate text-sm',
                      description ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {description || 'Add a note'}
                  </span>
                </span>
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )
          ) : (
            <div className="flex items-center gap-2 h-10 rounded-md border border-input bg-transparent px-3 shadow-sm focus-within:ring-1 focus-within:ring-ring">
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onKeyDown={handleIdleKeyDown}
                placeholder="What are you working on?"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                aria-label="Session description"
              />
            </div>
          )}

          {isEmptyState ? (
            <div className="flex flex-col items-center gap-3 pt-4 pb-1">
              <button
                type="button"
                onClick={handleStart}
                aria-label="Start your first session"
                className="rounded-full bg-muted p-5 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
              >
                <Play className="h-8 w-8" />
              </button>
              <div className="text-center max-w-[260px]">
                <div className="text-sm font-medium">No sessions yet</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Describe what you’re about to do, then press play. We’ll
                  record it as your first session.
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 pt-2 sm:grid sm:grid-cols-3 sm:items-start sm:gap-4">
              <div className="min-w-0 order-1 sm:order-none">
                {showSuggestions ? (
                  <div className="space-y-1.5">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Recent
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:flex-col sm:items-start">
                      {recents.map((value) => (
                        <button
                          key={value}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSuggestionPick(value)}
                          className="inline-flex items-center gap-1.5 h-7 max-w-full px-2.5 rounded-md text-xs border border-border bg-background text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                        >
                          <Clock className="h-3 w-3 shrink-0" />
                          <span className="truncate">{truncate(value)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col items-center gap-3 order-2 sm:order-none">
                <button
                  type="button"
                  onClick={isCounting ? handleStop : handleStart}
                  aria-label={
                    isCounting
                      ? 'Stop counting progress'
                      : 'Start counting progress'
                  }
                  className={cn(
                    'inline-flex h-24 w-24 items-center justify-center rounded-full text-white shadow transition-colors',
                    isCounting
                      ? 'bg-destructive hover:bg-destructive/90 pulse-ring'
                      : 'bg-chart-2 hover:bg-chart-2/95',
                  )}
                >
                  {isCounting ? (
                    <CircleStop className="h-20 w-20" />
                  ) : (
                    <CirclePlay className="h-20 w-20" />
                  )}
                </button>
                <div
                  className={cn(
                    'font-mono font-semibold tabular-nums text-3xl',
                    isCounting ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {formatSecondsToTime(count)}
                </div>
              </div>

              <div className="hidden sm:block" aria-hidden="true" />
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Discard this session?</DialogTitle>
            <DialogDescription>
              Your timer ({formatSecondsToTime(count)})
              {description.trim() ? (
                <>
                  {' '}and the note <em>“{truncate(description, 48)}”</em>
                </>
              ) : null}{' '}
              will be lost. The session won’t be saved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCancelConfirmOpen(false)}
            >
              Keep timing
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDiscard}
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
