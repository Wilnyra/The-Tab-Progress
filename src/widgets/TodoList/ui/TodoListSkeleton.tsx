import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'

const SKELETON_ITEMS_COUNT = 3

type TodoListSkeletonProps = {
  cardProps?: ComponentProps<typeof Card>
}

export const TodoListSkeleton = ({ cardProps }: TodoListSkeletonProps) => {
  return (
    <Card {...cardProps} className={cn('min-h-[280px]', cardProps?.className)}>
      <CardHeader className="flex justify-between flex-row items-start">
        <div className="space-y-1.5">
          <CardTitle>Todo</CardTitle>
          <CardDescription>
            These tasks will bring you to your aim
          </CardDescription>
        </div>
        <Skeleton className="h-9 w-9 rounded-md" />
      </CardHeader>

      <CardContent>
        <div className="flex space-y-3 flex-col">
          {Array.from({ length: SKELETON_ITEMS_COUNT }).map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
