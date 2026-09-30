import { Skeleton } from '@/shared/ui/Skeleton'

const NEXT_UP_KEYS = ['hours', 'days', 'streak', 'cells']
const GROUP_KEYS = ['hours', 'days']
const CARD_KEYS = ['a', 'b', 'c']

export const AchievementsSkeleton = (): JSX.Element => (
  <div aria-busy="true">
    <p role="status" className="sr-only">
      Loading achievements
    </p>
    <div className="space-y-8" aria-hidden="true">
      <Skeleton className="h-1.5 w-full rounded-full" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {NEXT_UP_KEYS.map((key) => (
            <Skeleton key={key} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
      {GROUP_KEYS.map((group) => (
        <div key={group} className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {CARD_KEYS.map((key) => (
              <Skeleton key={key} className="h-28 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)
