import { ProgressContextProvider } from '@/entities/progress'
import { CountProgress } from '@/features/progress/CountProgress'
import { ProgressCard } from '@/widgets/progress/ProgressCard'
import { ProgressComment } from '@/widgets/progress/ProgressComment'
import { ProgressInRow } from '@/widgets/progress/ProgressInRow'

export const ProgressPage = () => {
  return (
    <ProgressContextProvider>
      <h2 className="sr-only">Progress</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <CountProgress cardProps={{ className: 'w-full' }} />
        <ProgressInRow cardProps={{ className: 'w-full' }} />
        <ProgressComment cardProps={{ className: 'w-full' }} />
      </div>

      <div className="mt-6">
        <ProgressCard selectLimit />
      </div>
    </ProgressContextProvider>
  )
}
