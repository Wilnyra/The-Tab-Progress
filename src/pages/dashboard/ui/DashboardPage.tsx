import { PhotosCarousel } from '@/widgets/PhotosCarousel'
import { ProgressCard } from '@/widgets/progress/ProgressCard'
import { TodoList } from '@/widgets/TodoList'

export const DashboardPage = () => {
  return (
    <>
      <PhotosCarousel />
      <ProgressCard />
      <div className="md:flex justify-between space-y-4 md:space-y-0">
        <TodoList cardProps={{ className: 'md:w-[calc(50%-0.5rem)] w-full' }} />
      </div>
    </>
  )
}
