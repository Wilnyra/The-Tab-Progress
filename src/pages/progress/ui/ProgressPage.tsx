import { ProgressContextProvider } from '@/entities/progress'
import { CountProgress } from '@/features/progress/CountProgress'
import { ProgressCard } from '@/widgets/ProgressCard'

export const ProgressPage = () => {
  return (
    <ProgressContextProvider>
      <CountProgress cardProps={{ className: 'lg:w-1/3 md:w-1/2 w-full' }} />
      <ProgressCard selectLimit />
    </ProgressContextProvider>
  )
}
