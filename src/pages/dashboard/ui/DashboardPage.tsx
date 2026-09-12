import { PathList } from '@/widgets/PathList'
import { PhotosCarousel } from '@/widgets/PhotosCarousel'
import { ProgressCard } from '@/widgets/progress/ProgressCard'
import { TodoList } from '@/widgets/TodoList'

const HALF_WIDTH_CARD_PROPS = {
  variant: 'section',
  className: 'md:w-[calc(50%-0.5rem)] w-full',
} as const

export const DashboardPage = () => {
  return (
    <>
      <h2 className="sr-only">Dashboard</h2>
      <PhotosCarousel />
      <ProgressCard />
      <div className="flex flex-col justify-between gap-2 sm:gap-4 md:flex-row">
        <TodoList cardProps={HALF_WIDTH_CARD_PROPS} />
        <PathList cardProps={HALF_WIDTH_CARD_PROPS} />
      </div>
    </>
  )
}
