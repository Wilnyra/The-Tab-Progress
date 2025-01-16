import { ProgressContextProvider } from '@/entities/progress'
import { CountProgress } from '@/features/progress/CountProgress'
import { ProgressCard } from '@/widgets/ProgressCard'
import { ProgressInRow } from '@/widgets/ProgressInRow'

export const ProgressPage = () => {
  return (
    <ProgressContextProvider>
      <div className="flex gap-4">
        <CountProgress cardProps={{ className: 'lg:w-1/3 md:w-1/2 w-full' }} />
        <ProgressInRow cardProps={{ className: 'lg:w-1/3 md:w-1/2 w-full' }} />
      </div>

      <ProgressCard selectLimit />
    </ProgressContextProvider>
  )
}
