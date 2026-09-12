import {
  CountProgress,
  CountProgressProvider,
} from '@/features/progress/CountProgress'
import { ProgressCard } from '@/widgets/progress/ProgressCard'
import { ProgressInRow } from '@/widgets/progress/ProgressInRow'
import { ProgressTable } from '@/widgets/progress/ProgressTable'

const FULL_WIDTH_CARD_PROPS = {
  variant: 'section',
  className: 'w-full h-full',
} as const

export const ProgressPage = () => {
  return (
    <CountProgressProvider>
      <h2 className="sr-only">Progress</h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4">
        <div className="sm:col-span-2">
          <CountProgress cardProps={FULL_WIDTH_CARD_PROPS} />
        </div>
        <ProgressInRow cardProps={FULL_WIDTH_CARD_PROPS} />
      </div>

      <div className="mt-2 sm:mt-4">
        <ProgressCard selectLimit />
      </div>

      <div className="mt-2 sm:mt-4">
        <ProgressTable />
      </div>
    </CountProgressProvider>
  )
}
