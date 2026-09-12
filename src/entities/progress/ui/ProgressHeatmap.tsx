import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import { localDayKey } from '../lib/localDayKey'
import { cn } from '@/shared/lib/cn'
import { formatMinutesToHm } from '@/shared/lib/formatMinutesToHm'

type HeatmapDay = {
  index: number
  key: string
  date: Date
  seconds: number
  level: number
}

type HeatmapWeek = Array<HeatmapDay | null>

type TooltipPosition = {
  left: number
  top: number
}

type ProgressHeatmapProps = {
  totals: ReadonlyMap<string, number>
  dayCount: number
}

const DAYS_IN_WEEK = 7
const LEVEL_CLASSES = [
  'bg-muted',
  'bg-chart-2/25',
  'bg-chart-2/50',
  'bg-chart-2/75',
  'bg-chart-2',
] as const
const MAX_LEVEL = LEVEL_CLASSES.length - 1
const CELL_SIZE = 'size-[9px] sm:size-3 md:size-3.5'
const CELL_HEIGHT = 'h-[9px] sm:h-3 md:h-3.5'
const CELL_WIDTH = 'w-[9px] sm:w-3 md:w-3.5'
const CELL_GAP = 'gap-0.5 sm:gap-1'
const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''] as const
const MIN_LABEL_SPACING_WEEKS = 3
const TOOLTIP_OFFSET_PX = 6
const TOOLTIP_EDGE_PX = 88

const KEY_STEPS: Readonly<Record<string, number>> = {
  ArrowUp: -1,
  ArrowDown: 1,
  ArrowLeft: -DAYS_IN_WEEK,
  ArrowRight: DAYS_IN_WEEK,
}

const toLevel = (seconds: number, max: number): number => {
  if (seconds <= 0 || max <= 0) return 0
  return Math.min(MAX_LEVEL, Math.ceil((seconds / max) * MAX_LEVEL))
}

const buildDays = (
  totals: ReadonlyMap<string, number>,
  dayCount: number,
): HeatmapDay[] => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (dayCount - 1))

  const raw = Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const key = localDayKey(date)
    return { index, key, date, seconds: totals.get(key) ?? 0 }
  })
  const max = raw.reduce((acc, day) => Math.max(acc, day.seconds), 0)
  return raw.map((day) => ({ ...day, level: toLevel(day.seconds, max) }))
}

const buildWeeks = (days: HeatmapDay[]): HeatmapWeek[] => {
  const leading = days[0]?.date.getDay() ?? 0
  const slots: HeatmapWeek = [
    ...Array.from({ length: leading }, () => null),
    ...days,
  ]
  const weeks: HeatmapWeek[] = []
  for (let i = 0; i < slots.length; i += DAYS_IN_WEEK) {
    const week = slots.slice(i, i + DAYS_IN_WEEK)
    while (week.length < DAYS_IN_WEEK) week.push(null)
    weeks.push(week)
  }
  return weeks
}

const firstDayOf = (week: HeatmapWeek | undefined): HeatmapDay | null =>
  week?.find((day): day is HeatmapDay => day !== null) ?? null

const buildMonthLabels = (weeks: HeatmapWeek[]): string[] => {
  const labels = weeks.map((week, index) => {
    const first = firstDayOf(week)
    const previous = firstDayOf(weeks[index - 1])
    if (!first) return ''
    if (previous && previous.date.getMonth() === first.date.getMonth()) {
      return ''
    }
    return first.date.toLocaleDateString('en-US', { month: 'short' })
  })
  const nextLabelIndex = labels.findIndex((label, index) => index > 0 && label)
  if (nextLabelIndex > 0 && nextLabelIndex < MIN_LABEL_SPACING_WEEKS) {
    labels[0] = ''
  }
  return labels
}

const formatDayLabel = (date: Date): string =>
  date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const formatDuration = (seconds: number): string =>
  seconds > 0 ? formatMinutesToHm(seconds / 60) : 'No progress'

const readCellIndex = (target: EventTarget): number | null => {
  if (!(target instanceof Element)) return null
  const raw = target.closest<HTMLElement>('[data-index]')?.dataset.index
  return raw === undefined ? null : Number(raw)
}

export const ProgressHeatmap = ({
  totals,
  dayCount,
}: ProgressHeatmapProps): JSX.Element => {
  const days = useMemo(() => buildDays(totals, dayCount), [totals, dayCount])
  const weeks = useMemo(() => buildWeeks(days), [days])
  const monthLabels = useMemo(() => buildMonthLabels(weeks), [weeks])

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const lastPointerTypeRef = useRef<string>('mouse')
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<TooltipPosition | null>(null)

  const activeDay = activeIndex === null ? null : days[activeIndex] ?? null
  const hasActive = activeIndex !== null

  const updateTooltip = useCallback((): void => {
    if (activeIndex === null) {
      setTooltip(null)
      return
    }
    const cell = scrollRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    )
    if (!cell) {
      setTooltip(null)
      return
    }
    const rect = cell.getBoundingClientRect()
    const center = rect.left + rect.width / 2
    setTooltip({
      left: Math.min(
        Math.max(center, TOOLTIP_EDGE_PX),
        window.innerWidth - TOOLTIP_EDGE_PX,
      ),
      top: rect.top - TOOLTIP_OFFSET_PX,
    })
  }, [activeIndex])

  useLayoutEffect(() => {
    const container = scrollRef.current
    if (container) container.scrollLeft = container.scrollWidth
    setActiveIndex(null)
  }, [dayCount])

  useLayoutEffect(() => {
    updateTooltip()
  }, [updateTooltip])

  useEffect(() => {
    if (!hasActive) return
    const container = scrollRef.current
    window.addEventListener('scroll', updateTooltip, { passive: true })
    window.addEventListener('resize', updateTooltip)
    container?.addEventListener('scroll', updateTooltip, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateTooltip)
      window.removeEventListener('resize', updateTooltip)
      container?.removeEventListener('scroll', updateTooltip)
    }
  }, [hasActive, updateTooltip])

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>): void => {
      lastPointerTypeRef.current = event.pointerType
    },
    [],
  )

  const handlePointerOver = useCallback(
    (event: PointerEvent<HTMLDivElement>): void => {
      if (event.pointerType !== 'mouse') return
      const index = readCellIndex(event.target)
      if (index !== null) setActiveIndex(index)
    },
    [],
  )

  const handlePointerLeave = useCallback(
    (event: PointerEvent<HTMLDivElement>): void => {
      if (event.pointerType === 'mouse') setActiveIndex(null)
    },
    [],
  )

  const handleClick = useCallback((event: MouseEvent<HTMLDivElement>): void => {
    const index = readCellIndex(event.target)
    if (lastPointerTypeRef.current === 'mouse') {
      if (index !== null) setActiveIndex(index)
      return
    }
    setActiveIndex((current) =>
      index === null || current === index ? null : index,
    )
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>): void => {
      const lastIndex = days.length - 1
      if (event.key === 'Escape') {
        setActiveIndex(null)
        return
      }
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault()
        setActiveIndex(event.key === 'Home' ? 0 : lastIndex)
        return
      }
      const step = event.key in KEY_STEPS ? KEY_STEPS[event.key] : undefined
      if (step === undefined) return
      event.preventDefault()
      setActiveIndex((current) =>
        current === null
          ? lastIndex
          : Math.min(lastIndex, Math.max(0, current + step)),
      )
    },
    [days.length],
  )

  const handleBlur = useCallback((): void => {
    setActiveIndex(null)
  }, [])

  useEffect(() => {
    if (activeIndex === null) return
    scrollRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [activeIndex])

  return (
    <div className="space-y-2">
      <div
        ref={scrollRef}
        role="group"
        tabIndex={0}
        aria-label={`Daily progress for the last ${dayCount} days. Use arrow keys to move between days.`}
        className="overflow-x-auto rounded-md pb-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onPointerDown={handlePointerDown}
        onPointerOver={handlePointerOver}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      >
        <div className="inline-flex gap-1.5 sm:gap-2">
          <div
            className={cn(
              'flex w-6 shrink-0 flex-col pt-4 text-[10px] leading-none text-muted-foreground',
              CELL_GAP,
            )}
            aria-hidden="true"
          >
            {WEEKDAY_LABELS.map((label, row) => (
              <div
                key={`weekday-${row}`}
                className={cn('flex items-center', CELL_HEIGHT)}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <div
              className={cn(
                'flex h-3 text-[10px] leading-none text-muted-foreground',
                CELL_GAP,
              )}
              aria-hidden="true"
            >
              {monthLabels.map((label, column) => (
                <div
                  key={`month-${column}`}
                  className={cn('shrink-0 whitespace-nowrap', CELL_WIDTH)}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className={cn('flex', CELL_GAP)}>
              {weeks.map((week, column) => (
                <div
                  key={firstDayOf(week)?.key ?? `week-${column}`}
                  className={cn('flex flex-col', CELL_GAP)}
                >
                  {week.map((day, row) =>
                    day ? (
                      <div
                        key={day.key}
                        data-index={day.index}
                        className={cn(
                          'rounded-sm',
                          CELL_SIZE,
                          LEVEL_CLASSES[day.level],
                          activeIndex === day.index
                            ? 'ring-1 ring-foreground'
                            : '',
                        )}
                      />
                    ) : (
                      <div key={`empty-${column}-${row}`} className={CELL_SIZE} />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground"
        aria-hidden="true"
      >
        <span className="mr-1">Less</span>
        {LEVEL_CLASSES.map((levelClass) => (
          <div
            key={levelClass}
            className={cn('size-2.5 rounded-sm sm:size-3', levelClass)}
          />
        ))}
        <span className="ml-1">More</span>
      </div>

      <p className="sr-only" aria-live="polite">
        {activeDay
          ? `${formatDayLabel(activeDay.date)}: ${formatDuration(activeDay.seconds)}`
          : ''}
      </p>

      {activeDay && tooltip ? (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md"
          style={{ left: tooltip.left, top: tooltip.top }}
        >
          <span className="font-semibold">
            {formatDuration(activeDay.seconds)}
          </span>
          <span className="text-muted-foreground">
            {' · '}
            {formatDayLabel(activeDay.date)}
          </span>
        </div>
      ) : null}
    </div>
  )
}
