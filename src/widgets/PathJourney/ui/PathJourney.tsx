import { useJourneyData } from '../lib/useJourneyData'
import { JourneyHero } from './JourneyHero'
import { JourneyTimeline } from './JourneyTimeline'
import { PathEmptyState } from '@/entities/path'
import { AddPathDialog } from '@/features/path/AddPath'
import { Button } from '@/shared/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'

const SKELETON_TILES = ['hours', 'days', 'streak', 'milestones']
const SKELETON_NODES = ['first', 'second', 'third']

const JourneySkeleton = (): JSX.Element => (
  <div className="space-y-10">
    <div className="space-y-5">
      <div className="space-y-3">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SKELETON_TILES.map((key) => (
          <Skeleton key={key} className="h-[76px] rounded-lg" />
        ))}
      </div>
    </div>
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="mx-1.5 mt-1 h-3 w-3 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      {SKELETON_NODES.map((key) => (
        <div key={key} className="flex items-start gap-3">
          <Skeleton className="mx-1.5 mt-[22px] h-3 w-3 shrink-0 rounded-full" />
          <Skeleton className="h-[74px] flex-1 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
)

export const PathJourney = (): JSX.Element => {
  const { journey, isLoading, error, reload } = useJourneyData()

  const renderBody = (): JSX.Element => {
    if (isLoading && journey === null) return <JourneySkeleton />

    if (error && journey === null) {
      return (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t load your path. {error.message}
          </p>
          <Button variant="outline" onClick={reload}>
            Try again
          </Button>
        </div>
      )
    }

    if (journey === null) {
      return (
        <PathEmptyState
          rightSlot={
            <AddPathDialog triggerLabel="Add milestone" onComplete={reload} />
          }
        />
      )
    }

    return (
      <div className="space-y-10">
        <JourneyHero summary={journey.summary} />
        <div className="space-y-4">
          {journey.summary.milestones === 0 ? (
            <p className="text-sm text-muted-foreground">
              Mark a moment that mattered — tap + to add your first milestone.
            </p>
          ) : null}
          <JourneyTimeline items={journey.items} onChange={reload} />
        </div>
      </div>
    )
  }

  return (
    <Card variant="section">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="space-y-1.5">
          <CardTitle>Path</CardTitle>
          <CardDescription>
            Your milestones and progress over time
          </CardDescription>
        </div>
        <AddPathDialog onComplete={reload} />
      </CardHeader>
      <CardContent>{renderBody()}</CardContent>
    </Card>
  )
}
