import { CountProgress } from '@/features/progress/CountProgress'
import { ProgressCard } from '@/widgets/progress/ProgressCard'
import { ProgressInRow } from '@/widgets/progress/ProgressInRow'

const FULL_WIDTH_CARD_PROPS = { className: 'w-full h-full' } as const

export const ProgressPage = () => {
  return (
    <>
      <h2 className="sr-only">Progress</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <CountProgress cardProps={FULL_WIDTH_CARD_PROPS} />
        </div>
        <ProgressInRow cardProps={FULL_WIDTH_CARD_PROPS} />
      </div>

      <div className="mt-4">
        <ProgressCard selectLimit />
      </div>
    </>
  )
}
