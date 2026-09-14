import { ChevronDown, Play } from 'lucide-react'
import { useCallback, useId, useState } from 'react'
import { formatDayLabel } from '../lib/formatDayLabel'
import { ProgressTableSkeleton } from './ProgressTableSkeleton'
import {
  aggregateEventsToDayRows,
  groupDayEntries,
  useEventsLast30Days,
  type ProgressDayEntry,
  type ProgressDayRow,
  type ProgressTaskGroup,
} from '@/entities/progress'
import { EditProgressDialog } from '@/features/progress/AddProgress'
import { useCountProgress } from '@/features/progress/CountProgress'
import { cn } from '@/shared/lib/cn'
import { formatMinutesToHm } from '@/shared/lib/formatMinutesToHm'
import { formatSecondsToTime } from '@/shared/lib/formatSecondsToTime'
import { Button } from '@/shared/ui/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/Table'
import { useToast } from '@/shared/ui/Toast'

type EntryHandlers = {
  isTimerRunning: boolean
  onEdit: (entry: ProgressDayEntry) => void
  onContinue: (entry: ProgressDayEntry) => void
}

const ROW_BUTTON_CLASS =
  'flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 rounded-md px-2 text-left text-sm transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring lg:min-h-8'
const ACTION_SLOT_CLASS = 'w-11 shrink-0 lg:w-8'

// A few-second session rounds to "0m", which reads as "nothing was tracked".
const formatDuration = (seconds: number): string => {
  if (seconds > 0 && seconds < 60) return '<1m'
  return formatMinutesToHm(seconds / 60)
}

const formatTimeOfDay = (iso: string): string =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

type DurationProps = {
  seconds: number
  isExpanded: boolean | null
}

const Duration = ({ seconds, isExpanded }: DurationProps): JSX.Element => (
  <span className="flex shrink-0 items-center gap-1 tabular-nums text-muted-foreground">
    {formatDuration(seconds)}
    {isExpanded === null ? (
      <span className="w-4" aria-hidden="true" />
    ) : (
      <ChevronDown
        className={cn(
          'h-4 w-4 transition-transform motion-reduce:transition-none',
          isExpanded ? 'rotate-180' : '',
        )}
        aria-hidden="true"
      />
    )}
  </span>
)

type TaskLabelProps = {
  group: ProgressTaskGroup
}

const TaskLabel = ({ group }: TaskLabelProps): JSX.Element => (
  <span className="flex min-w-0 items-baseline gap-1.5">
    <span
      className={cn(
        'min-w-0 whitespace-pre-line break-words',
        group.text ? 'text-foreground' : 'text-muted-foreground',
      )}
    >
      {group.text ?? 'No note'}
    </span>
    {group.entries.length > 1 ? (
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        ×{group.entries.length}
      </span>
    ) : null}
  </span>
)

type ContinueButtonProps = {
  label: string
  entry: ProgressDayEntry
  isTimerRunning: boolean
  onContinue: (entry: ProgressDayEntry) => void
}

const ContinueButton = ({
  label,
  entry,
  isTimerRunning,
  onContinue,
}: ContinueButtonProps): JSX.Element => {
  const handleClick = (): void => onContinue(entry)

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={isTimerRunning}
      aria-label={`Continue: ${label}`}
      className="shrink-0 text-muted-foreground hover:text-foreground lg:h-8 lg:w-8"
    >
      <Play />
    </Button>
  )
}

type SessionItemProps = {
  entry: ProgressDayEntry
  onEdit: (entry: ProgressDayEntry) => void
}

const SessionItem = ({ entry, onEdit }: SessionItemProps): JSX.Element => {
  const time = formatTimeOfDay(entry.createdAt)
  const handleClick = (): void => onEdit(entry)

  return (
    <li className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        aria-label={`Edit session at ${time}, ${formatDuration(entry.durationSeconds)}`}
        className={cn(ROW_BUTTON_CLASS, 'pl-8')}
      >
        <span className="tabular-nums text-muted-foreground">{time}</span>
        <Duration seconds={entry.durationSeconds} isExpanded={null} />
      </button>
      <span className={ACTION_SLOT_CLASS} aria-hidden="true" />
    </li>
  )
}

type TaskItemProps = EntryHandlers & {
  group: ProgressTaskGroup
}

const TaskItem = ({
  group,
  isTimerRunning,
  onEdit,
  onContinue,
}: TaskItemProps): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState(false)
  const sessionsId = useId()
  const label = group.text ?? 'No note'
  const isGroup = group.entries.length > 1

  const handleRowClick = (): void => {
    if (isGroup) {
      setIsExpanded((prev) => !prev)
      return
    }
    onEdit(group.latest)
  }

  return (
    <li>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleRowClick}
          aria-expanded={isGroup ? isExpanded : undefined}
          aria-controls={isGroup ? sessionsId : undefined}
          className={ROW_BUTTON_CLASS}
        >
          <span className="sr-only">
            {isGroup ? `${group.entries.length} sessions: ` : 'Edit entry: '}
          </span>
          <TaskLabel group={group} />
          <Duration
            seconds={group.totalSeconds}
            isExpanded={isGroup ? isExpanded : null}
          />
        </button>
        <ContinueButton
          label={label}
          entry={group.latest}
          isTimerRunning={isTimerRunning}
          onContinue={onContinue}
        />
      </div>
      {isGroup && isExpanded ? (
        <ul id={sessionsId} className="space-y-0.5">
          {group.entries.map((entry) => (
            <SessionItem key={entry.id} entry={entry} onEdit={onEdit} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

type TaskListProps = EntryHandlers & {
  entries: ProgressDayEntry[]
}

const TaskList = ({ entries, ...handlers }: TaskListProps): JSX.Element => (
  <ul className="space-y-0.5">
    {groupDayEntries(entries).map((group) => (
      <TaskItem key={group.key} group={group} {...handlers} />
    ))}
  </ul>
)

type ProgressTableRowProps = EntryHandlers & {
  row: ProgressDayRow
}

const ProgressTableRow = ({
  row,
  ...handlers
}: ProgressTableRowProps): JSX.Element => (
  <TableRow>
    <TableCell className="whitespace-nowrap align-top font-medium">
      {formatDayLabel(row.dayStart)}
    </TableCell>
    <TableCell className="whitespace-nowrap align-top font-mono tabular-nums">
      {formatSecondsToTime(row.totalSeconds)}
    </TableCell>
    <TableCell className="text-muted-foreground">
      <TaskList entries={row.entries} {...handlers} />
    </TableCell>
  </TableRow>
)

type ProgressDayListProps = EntryHandlers & {
  rows: ProgressDayRow[]
}

const ProgressDayList = ({
  rows,
  ...handlers
}: ProgressDayListProps): JSX.Element => (
  <ul className="divide-y">
    {rows.map((row) => (
      <li key={row.dayKey} className="py-3 first:pt-0 last:pb-0">
        <div className="flex items-baseline justify-between gap-3 px-2 pb-1">
          <h3 className="text-sm font-medium">
            {formatDayLabel(row.dayStart)}
          </h3>
          <span className="font-mono text-sm tabular-nums text-muted-foreground">
            {formatSecondsToTime(row.totalSeconds)}
          </span>
        </div>
        <TaskList entries={row.entries} {...handlers} />
      </li>
    ))}
  </ul>
)

export const ProgressDaysContent = (): JSX.Element => {
  const { events, isLoading, error } = useEventsLast30Days()
  const { isCounting, startCount } = useCountProgress()
  const { showToast } = useToast()
  const [editingEntry, setEditingEntry] = useState<ProgressDayEntry | null>(
    null,
  )
  const [isEditOpen, setIsEditOpen] = useState(false)
  const rows = aggregateEventsToDayRows(events)

  const handleEdit = useCallback((entry: ProgressDayEntry): void => {
    setEditingEntry(entry)
    setIsEditOpen(true)
  }, [])

  const handleContinue = useCallback(
    (entry: ProgressDayEntry): void => {
      if (isCounting) return
      startCount(entry.text ?? '')
      showToast({ message: 'Timer started' })
    },
    [isCounting, startCount, showToast],
  )

  const handlers: EntryHandlers = {
    isTimerRunning: isCounting,
    onEdit: handleEdit,
    onContinue: handleContinue,
  }

  const renderBody = (): JSX.Element => {
    if (isLoading && rows.length === 0) return <ProgressTableSkeleton />

    if (error) {
      return (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Failed to load progress days. Try reloading the page.
        </p>
      )
    }

    if (rows.length === 0) {
      return (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No records for the last 30 days yet.
        </p>
      )
    }

    return (
      <>
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Day</TableHead>
                <TableHead className="w-[120px]">Progress</TableHead>
                <TableHead>Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <ProgressTableRow key={row.dayKey} row={row} {...handlers} />
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="lg:hidden">
          <ProgressDayList rows={rows} {...handlers} />
        </div>
      </>
    )
  }

  return (
    <>
      {renderBody()}
      <EditProgressDialog
        entry={editingEntry}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  )
}
