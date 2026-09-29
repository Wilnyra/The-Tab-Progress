import { Award, Flag, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { formatFullDate, formatShortDate, hasActivity } from './formatJourney'
import { IntervalStats } from './JourneyInterval'
import { RailRow } from './JourneyRail'
import type {
  JourneyInterval as JourneyIntervalStats,
  JourneyMilestone,
} from '@/entities/path'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/DropdownMenu'

type MilestoneMenuProps = {
  onEdit: () => void
  onDelete: () => void
}

const MilestoneMenu = ({
  onEdit,
  onDelete,
}: MilestoneMenuProps): JSX.Element => {
  const [open, setOpen] = useState(false)

  const handleEdit = (): void => {
    setOpen(false)
    onEdit()
  }

  const handleDelete = (): void => {
    setOpen(false)
    onDelete()
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'transition-opacity touch-visible',
            open && 'opacity-100',
          )}
          aria-label="Milestone options"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const MANUAL_DOT = 'mt-[22px] h-3 w-3 rounded-full bg-primary ring-4 ring-card'
const AUTO_MARKER =
  'flex h-6 w-6 items-center justify-center rounded-full bg-muted ' +
  'text-muted-foreground ring-4 ring-card'

export const AchievementMarker = (): JSX.Element => (
  <div className={AUTO_MARKER}>
    <Award className="h-3.5 w-3.5" aria-hidden="true" />
  </div>
)
const START_MARKER =
  'mt-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary ' +
  'text-primary-foreground ring-4 ring-card'

type JourneyNodeProps = {
  milestone: JourneyMilestone
  onEdit: (id: string, step: string) => void
  onDelete: (id: string, step: string) => void
}

export const JourneyNode = ({
  milestone,
  onEdit,
  onDelete,
}: JourneyNodeProps): JSX.Element => {
  const handleEdit = (): void => onEdit(milestone.id, milestone.step)
  const handleDelete = (): void => onDelete(milestone.id, milestone.step)

  if (milestone.kind === 'auto') {
    return (
      <RailRow marker={<AchievementMarker />}>
        <div className="flex min-h-6 items-baseline justify-between gap-3 pt-0.5">
          <p className="min-w-0 break-words text-sm text-muted-foreground">
            <span className="mr-1.5 text-[11px] font-medium uppercase tracking-wide">
              Achievement
            </span>
            {milestone.step}
          </p>
          <p className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {formatFullDate(milestone.at)}
          </p>
        </div>
      </RailRow>
    )
  }

  return (
    <RailRow marker={<div className={MANUAL_DOT} />}>
      <div className="flex items-start gap-2 rounded-lg border bg-background p-4">
        <div className="min-w-0 flex-1">
          <p className="break-words text-base font-medium">{milestone.step}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatFullDate(milestone.at)}
          </p>
        </div>
        <div className="-my-2.5 -mr-2.5 shrink-0">
          <MilestoneMenu onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      </div>
    </RailRow>
  )
}

type JourneyStartProps = {
  at: string
}

export const JourneyStart = ({ at }: JourneyStartProps): JSX.Element => (
  <RailRow
    marker={
      <div className={START_MARKER}>
        <Flag className="h-3.5 w-3.5" aria-hidden="true" />
      </div>
    }
  >
    <div className="rounded-lg border bg-background p-4">
      <p className="text-base font-medium">First entry</p>
      <p className="mt-1 text-xs text-muted-foreground">{formatFullDate(at)}</p>
    </div>
  </RailRow>
)

type JourneyTodayProps = {
  stats: JourneyIntervalStats
  sinceAt: string | null
}

export const JourneyToday = ({
  stats,
  sinceAt,
}: JourneyTodayProps): JSX.Element => {
  const since = sinceAt === null ? 'your first entry' : formatShortDate(sinceAt)

  return (
    <RailRow
      marker={
        <div className="mt-1 h-3 w-3 rounded-full border-2 border-primary bg-background ring-4 ring-card" />
      }
    >
      <p className="text-sm font-medium">
        Today · {formatShortDate(new Date())}
      </p>
      {hasActivity(stats) ? (
        <div className="mt-1.5 space-y-1.5">
          <p className="text-xs text-muted-foreground">Since {since}</p>
          <IntervalStats stats={stats} />
        </div>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground/70">
          No progress since {since}
        </p>
      )}
    </RailRow>
  )
}
