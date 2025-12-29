import { PathList } from '@/widgets/PathList'
import { PhotosCarousel } from '@/widgets/PhotosCarousel'
import { ProgressCard } from '@/widgets/progress/ProgressCard'
import { TodoList } from '@/widgets/TodoList'

export const DashboardPage = () => {
  return (
    <>
      <h2 className="sr-only">Dashboard</h2>
      <PhotosCarousel />
      <ProgressCard />
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <TodoList cardProps={{ className: 'md:w-[calc(50%-0.5rem)] w-full' }} />
        <PathList cardProps={{ className: 'md:w-[calc(50%-0.5rem)] w-full' }} />
      </div>
    </>
  )
}
