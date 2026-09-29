import { ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import {
  describeInterval,
  formatMonth,
  formatShortDate,
  monthKey,
  plural,
  sumIntervals,
} from './formatJourney'
import { JourneyInterval } from './JourneyInterval'
import {
  AchievementMarker,
  JourneyNode,
  JourneyStart,
  JourneyToday,
} from './JourneyNode'
import { RailLine, RailRow } from './JourneyRail'
import type {
  JourneyInterval as JourneyIntervalStats,
  JourneyItem,
  JourneyMilestone,
} from '@/entities/path'
import { DeletePathDialog } from '@/features/path/DeletePath'
import { EditPathDialog } from '@/features/path/EditPath'
import { cn } from '@/shared/lib/cn'

const DIALOG_CLOSE_DELAY_MS = 300
const MIN_GROUP_SIZE = 2

type Selected = { id: string; step: string }

type JourneyTimelineProps = {
  items: JourneyItem[]
  onChange: () => void
}

type MilestoneRow = {
  kind: 'milestone'
  id: string
  milestone: JourneyMilestone
}

type ItemRow =
  | {
      kind: 'today'
      id: string
      stats: JourneyIntervalStats
      sinceAt: string | null
    }
  | { kind: 'interval'; id: string; stats: JourneyIntervalStats }
  | MilestoneRow
  | { kind: 'start'; id: string; at: string }

type MonthRow = { kind: 'month'; id: string; at: string }

type FlatRow = ItemRow | MonthRow

type GroupRow = {
  kind: 'group'
  id: string
  milestones: JourneyMilestone[]
  rows: ItemRow[]
}

type TimelineRow = FlatRow | GroupRow

type MonthHeaderProps = {
  at: string
}

const MonthHeader = ({ at }: MonthHeaderProps): JSX.Element => (
  <div className="relative z-10 pb-1 pt-5">
    <h4 className="inline-flex rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {formatMonth(at)}
    </h4>
  </div>
)

const sinceOf = (items: JourneyItem[]): string | null => {
  const next = items[1]
  return next?.type === 'milestone' ? next.milestone.at : null
}

const toItemRow = (
  item: JourneyItem,
  index: number,
  items: JourneyItem[],
): ItemRow => {
  if (item.type === 'interval') {
    return index === 0
      ? {
          kind: 'today',
          id: item.id,
          stats: item.stats,
          sinceAt: sinceOf(items),
        }
      : { kind: 'interval', id: item.id, stats: item.stats }
  }
  if (item.type === 'start') return { kind: 'start', id: item.id, at: item.at }
  return { kind: 'milestone', id: item.id, milestone: item.milestone }
}

const rowDate = (row: ItemRow): string | null => {
  if (row.kind === 'start') return row.at
  if (row.kind === 'milestone') return row.milestone.at
  return null
}

const toFlatRows = (items: JourneyItem[]): FlatRow[] => {
  const seenMonths = new Set<string>()
  let previousMonth: string | null = null
  return items.flatMap((item, index): FlatRow[] => {
    const row = toItemRow(item, index, items)
    const at = rowDate(row)
    if (at === null) return [row]
    const month = monthKey(at)
    const isNewMonth = month !== previousMonth && !seenMonths.has(month)
    previousMonth = month
    seenMonths.add(month)
    return isNewMonth
      ? [{ kind: 'month', id: `month:${month}`, at }, row]
      : [row]
  })
}

const isAutoRow = (row: FlatRow | undefined): row is MilestoneRow =>
  row?.kind === 'milestone' && row.milestone.kind === 'auto'

const collectGroup = (rows: FlatRow[], from: number): ItemRow[] => {
  const members: ItemRow[] = []
  let cursor = from
  let current = rows[cursor]
  while (isAutoRow(current)) {
    members.push(current)
    const gap = rows[cursor + 1]
    const next = rows[cursor + 2]
    if (gap?.kind !== 'interval' || !isAutoRow(next)) break
    members.push(gap)
    cursor += 2
    current = next
  }
  return members
}

const collapseAchievements = (rows: FlatRow[]): TimelineRow[] => {
  const result: TimelineRow[] = []
  let index = 0
  while (index < rows.length) {
    const row = rows[index]
    const members = isAutoRow(row) ? collectGroup(rows, index) : []
    const milestones = members.flatMap((member) =>
      member.kind === 'milestone' ? [member.milestone] : [],
    )
    if (row !== undefined && milestones.length >= MIN_GROUP_SIZE) {
      result.push({
        kind: 'group',
        id: `group:${row.id}`,
        milestones,
        rows: members,
      })
      index += members.length
    } else {
      if (row !== undefined) result.push(row)
      index += 1
    }
  }
  return result
}

const rangeOf = (milestones: JourneyMilestone[]): string => {
  const newest = milestones[0]
  const oldest = milestones[milestones.length - 1]
  if (newest === undefined || oldest === undefined) return ''
  const from = formatShortDate(oldest.at)
  const to = formatShortDate(newest.at)
  return from === to ? from : `${from} – ${to}`
}

const mergedStatsOf = (rows: ItemRow[]): JourneyIntervalStats =>
  sumIntervals(
    rows.flatMap((row) => (row.kind === 'interval' ? [row.stats] : [])),
  )

type MergedStatsProps = {
  stats: JourneyIntervalStats
}

const MergedStats = ({ stats }: MergedStatsProps): JSX.Element => {
  const parts = describeInterval(stats)
  return parts.length > 0 ? (
    <span className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {parts.map(({ key, icon: Icon, text }) => (
        <span key={key} className="inline-flex items-center gap-1 tabular-nums">
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {text}
        </span>
      ))}
    </span>
  ) : (
    <span className="text-xs text-muted-foreground/70">No activity</span>
  )
}

type AchievementGroupProps = {
  milestones: JourneyMilestone[]
  rows: ItemRow[]
  renderRow: (row: ItemRow) => JSX.Element
}

const AchievementGroup = ({
  milestones,
  rows,
  renderRow,
}: AchievementGroupProps): JSX.Element => {
  const listId = useId()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggle = (): void => setIsExpanded((prev) => !prev)

  const merged = mergedStatsOf(rows)

  return (
    <>
      <RailRow marker={<AchievementMarker />}>
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls={isExpanded ? listId : undefined}
          onClick={handleToggle}
          className="flex min-h-11 w-full flex-col gap-1.5 rounded-md pb-1 pt-0.5 text-left text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex w-full items-center justify-between gap-3">
            <span className="min-w-0">
              {plural(milestones.length, 'achievement', 'achievements')}
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-xs tabular-nums">
              {rangeOf(milestones)}
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded ? 'rotate-180' : '',
                )}
              />
            </span>
          </span>
          {isExpanded ? null : <MergedStats stats={merged} />}
        </button>
      </RailRow>
      {isExpanded ? (
        <ol id={listId} className="mt-3 space-y-3">
          {rows.map((row) => (
            <li key={row.id}>{renderRow(row)}</li>
          ))}
        </ol>
      ) : null}
    </>
  )
}

export const JourneyTimeline = ({
  items,
  onChange,
}: JourneyTimelineProps): JSX.Element => {
  const [editing, setEditing] = useState<Selected | null>(null)
  const [deleting, setDeleting] = useState<Selected | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const handleEdit = (id: string, step: string): void => {
    setEditing({ id, step })
    setIsEditOpen(true)
  }

  const handleDelete = (id: string, step: string): void => {
    setDeleting({ id, step })
    setIsDeleteOpen(true)
  }

  const handleEditOpenChange = (open: boolean): void => {
    setIsEditOpen(open)
    if (!open) setTimeout(() => setEditing(null), DIALOG_CLOSE_DELAY_MS)
  }

  const handleDeleteOpenChange = (open: boolean): void => {
    setIsDeleteOpen(open)
    if (!open) setTimeout(() => setDeleting(null), DIALOG_CLOSE_DELAY_MS)
  }

  const handleEditComplete = (): void => {
    setIsEditOpen(false)
    setTimeout(() => {
      setEditing(null)
      onChange()
    }, DIALOG_CLOSE_DELAY_MS)
  }

  const handleDeleteComplete = (): void => {
    setIsDeleteOpen(false)
    setTimeout(() => {
      setDeleting(null)
      onChange()
    }, DIALOG_CLOSE_DELAY_MS)
  }

  const rows = collapseAchievements(toFlatRows(items))

  const renderItemRow = (row: ItemRow): JSX.Element => {
    if (row.kind === 'today') {
      return <JourneyToday stats={row.stats} sinceAt={row.sinceAt} />
    }
    if (row.kind === 'interval') return <JourneyInterval stats={row.stats} />
    if (row.kind === 'start') return <JourneyStart at={row.at} />
    return (
      <JourneyNode
        milestone={row.milestone}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    )
  }

  const renderRow = (row: TimelineRow): JSX.Element => {
    if (row.kind === 'month') return <MonthHeader at={row.at} />
    if (row.kind === 'group') {
      return (
        <AchievementGroup
          milestones={row.milestones}
          rows={row.rows}
          renderRow={renderItemRow}
        />
      )
    }
    return renderItemRow(row)
  }

  return (
    <>
      <section className="relative">
        <h3 className="sr-only">Timeline</h3>
        <RailLine />
        <ol className="space-y-3">
          {rows.map((row) => (
            <li key={row.id}>{renderRow(row)}</li>
          ))}
        </ol>
      </section>

      <EditPathDialog
        pathId={editing?.id ?? ''}
        currentStep={editing?.step ?? ''}
        open={isEditOpen}
        onOpenChange={handleEditOpenChange}
        onComplete={handleEditComplete}
      />
      <DeletePathDialog
        pathId={deleting?.id ?? ''}
        step={deleting?.step ?? ''}
        open={isDeleteOpen}
        onOpenChange={handleDeleteOpenChange}
        onComplete={handleDeleteComplete}
      />
    </>
  )
}
