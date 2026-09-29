import { describeInterval, hasActivity } from './formatJourney'
import { RailRow } from './JourneyRail'
import type { JourneyInterval as JourneyIntervalStats } from '@/entities/path'

type IntervalStatsProps = {
  stats: JourneyIntervalStats
}

export const IntervalStats = ({ stats }: IntervalStatsProps): JSX.Element => (
  <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
    {describeInterval(stats).map(({ key, icon: Icon, text }) => (
      <li key={key} className="inline-flex items-center gap-1 tabular-nums">
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {text}
      </li>
    ))}
  </ul>
)

const DashedRail = (): JSX.Element => (
  <>
    <span
      aria-hidden="true"
      className="absolute -inset-y-3 left-1/2 w-1 -translate-x-1/2 bg-card"
    />
    <span
      aria-hidden="true"
      className="absolute -inset-y-3 left-1/2 -translate-x-1/2 border-l border-dashed border-muted-foreground/40"
    />
  </>
)

type JourneyIntervalProps = {
  stats: JourneyIntervalStats
}

export const JourneyInterval = ({
  stats,
}: JourneyIntervalProps): JSX.Element => (
  <RailRow marker={<DashedRail />} className="py-1">
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span className="font-medium">Before this:</span>
      {hasActivity(stats) ? (
        <IntervalStats stats={stats} />
      ) : (
        <span className="text-muted-foreground/70">No activity</span>
      )}
    </div>
  </RailRow>
)
