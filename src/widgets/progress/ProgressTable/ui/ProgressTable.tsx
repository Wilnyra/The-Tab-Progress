import { Play } from 'lucide-react'
import { useCallback, useState } from 'react'
import { formatDayLabel } from '../lib/formatDayLabel'
import { ProgressTableSkeleton } from './ProgressTableSkeleton'
import {
  aggregateEventsToDayRows,
  useEventsLast30Days,
  type ProgressDayEntry,
  type ProgressDayRow,
} from '@/entities/progress'
import { EditProgressDialog } from '@/features/progress/AddProgress'
import { useCountProgress } from '@/features/progress/CountProgress'
import { cn } from '@/shared/lib/cn'
import { formatMinutesToHm } from '@/shared/lib/formatMinutesToHm'
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

type ProgressEntryItemProps = EntryHandlers & {
  entry: ProgressDayEntry
}

const ProgressEntryItem = ({
  entry,
  isTimerRunning,
  onEdit,
  onContinue,
}: ProgressEntryItemProps): JSX.Element => {
  const label = entry.text ?? 'No note'
  const handleEdit = (): void => onEdit(entry)
  const handleContinue = (): void => onContinue(entry)

  return (
    <li className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleEdit}
        className="flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 rounded-md px-2 text-left text-sm transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring lg:min-h-8"
      >
        <span className="sr-only">Edit entry: </span>
        <span
          className={cn(
            'min-w-0 whitespace-pre-line break-words',
            entry.text ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {label}
        </span>
        <span className="shrink-0 tabular-nums text-muted-foreground">
          {formatMinutesToHm(entry.durationSeconds / 60)}
        </span>
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleContinue}
        disabled={isTimerRunning}
        aria-label={`Continue: ${label}`}
        className="shrink-0 text-muted-foreground hover:text-foreground lg:h-8 lg:w-8"
      >
        <Play />
      </Button>
    </li>
  )
}

type ProgressEntryListProps = EntryHandlers & {
  entries: ProgressDayEntry[]
}

const ProgressEntryList = ({
  entries,
  ...handlers
}: ProgressEntryListProps): JSX.Element => (
  <ul className="space-y-0.5">
    {entries.map((entry) => (
      <ProgressEntryItem key={entry.id} entry={entry} {...handlers} />
    ))}
  </ul>
)

type ProgressTableRowProps = EntryHandlers & {
  row: ProgressDayRow
}

const ProgressTableRow = ({
  row,
  ...handlers
}: ProgressTableRowProps): JSX.Element => {
  return (
    <TableRow>
      <TableCell className="whitespace-nowrap font-medium">
        {formatDayLabel(row.dayStart)}
      </TableCell>
      <TableCell className="whitespace-nowrap font-mono tabular-nums">
        {formatSecondsToTime(row.totalSeconds)}
      </TableCell>
      <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground">
        {row.entries.length}
      </TableCell>
      <TableCell className="text-muted-foreground">
        <ProgressEntryList entries={row.entries} {...handlers} />
      </TableCell>
    </TableRow>
  )
}

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
        <ProgressEntryList entries={row.entries} {...handlers} />
      </li>
    ))}
  </ul>
)

export const ProgressTable = (): JSX.Element => {
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
                <TableHead className="w-[90px]">Records</TableHead>
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
      <Card variant="section">
        <CardHeader className="space-y-1.5">
          <CardTitle>Days</CardTitle>
          <CardDescription>
            Daily progress and activity for the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>{renderBody()}</CardContent>
      </Card>
      <EditProgressDialog
        entry={editingEntry}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  )
}
