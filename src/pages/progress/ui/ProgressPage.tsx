import { CountProgress } from '@/features/progress/CountProgress'
import { ProgressCard } from '@/widgets/ProgressCard'

export const ProgressPage = () => {
  return (
    <>
      <CountProgress cardProps={{ className: 'w-1/3' }} />
      <ProgressCard selectLimit />
    </>
  )
}
