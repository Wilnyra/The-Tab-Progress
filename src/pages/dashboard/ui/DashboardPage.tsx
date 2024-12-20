import { PhotosCarousel } from '@/widgets/PhotosCarousel'
import { ProgressCard } from '@/widgets/ProgressCard'
import { TodoList } from '@/widgets/TodoList'

export const DashboardPage = () => {
  return (
    <>
      <PhotosCarousel />
      <ProgressCard />
      <div className="flex justify-between">
        <TodoList cardProps={{ className: 'w-[calc(50%-0.5rem)]' }} />
      </div>
    </>
  )
}
