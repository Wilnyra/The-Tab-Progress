import { ProgressContextProvider } from '@/entities/progress'
import { CountProgress } from '@/features/progress/CountProgress'
import { ProgressCard } from '@/widgets/progress/ProgressCard'
import { ProgressComment } from '@/widgets/progress/ProgressComment'
import { ProgressInRow } from '@/widgets/progress/ProgressInRow'

const FULL_WIDTH_CARD_PROPS = { className: 'w-full' } as const

export const ProgressPage = () => {
  return (
    <ProgressContextProvider>
      <h2 className="sr-only">Progress</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <CountProgress cardProps={FULL_WIDTH_CARD_PROPS} />
        <ProgressInRow cardProps={FULL_WIDTH_CARD_PROPS} />
        <ProgressComment cardProps={FULL_WIDTH_CARD_PROPS} />
      </div>

      <div className="mt-6">
        <ProgressCard selectLimit />
      </div>
    </ProgressContextProvider>
  )
}
