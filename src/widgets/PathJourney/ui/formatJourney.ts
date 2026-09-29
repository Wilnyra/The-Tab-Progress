import { CalendarDays, Camera, Clock, LayoutGrid } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { JourneyInterval } from '@/entities/path'
import { formatMinutesToHm } from '@/shared/lib/formatMinutesToHm'

export const formatHours = (seconds: number): string =>
  formatMinutesToHm(seconds / 60)

export const formatFullDate = (iso: string | Date): string =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

export const formatShortDate = (
  iso: string | Date,
  now: Date = new Date(),
): string => {
  const date = new Date(iso)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  })
}

export const formatMonth = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

export const monthKey = (iso: string): string => {
  const date = new Date(iso)
  return `${date.getFullYear()}-${date.getMonth()}`
}

export const plural = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`

export type IntervalPart = {
  key: string
  icon: LucideIcon
  text: string
}

export const describeInterval = (stats: JourneyInterval): IntervalPart[] => {
  const parts: IntervalPart[] = []
  if (stats.seconds > 0) {
    parts.push({
      key: 'hours',
      icon: Clock,
      text: `+${formatHours(stats.seconds)} logged`,
    })
  }
  if (stats.activeDays > 0) {
    parts.push({
      key: 'days',
      icon: CalendarDays,
      text: plural(stats.activeDays, 'active day', 'active days'),
    })
  }
  if (stats.cells > 0) {
    parts.push({
      key: 'cells',
      icon: LayoutGrid,
      text: plural(stats.cells, 'map cell', 'map cells'),
    })
  }
  if (stats.photos > 0) {
    parts.push({
      key: 'photos',
      icon: Camera,
      text: plural(stats.photos, 'photo', 'photos'),
    })
  }
  return parts
}

export const hasActivity = (stats: JourneyInterval): boolean =>
  describeInterval(stats).length > 0

export const sumIntervals = (intervals: JourneyInterval[]): JourneyInterval =>
  intervals.reduce<JourneyInterval>(
    (total, stats) => ({
      seconds: total.seconds + stats.seconds,
      activeDays: total.activeDays + stats.activeDays,
      cells: total.cells + stats.cells,
      photos: total.photos + stats.photos,
    }),
    { seconds: 0, activeDays: 0, cells: 0, photos: 0 },
  )
