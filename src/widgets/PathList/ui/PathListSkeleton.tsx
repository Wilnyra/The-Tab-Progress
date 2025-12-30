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

type PathListSkeletonProps = {
  cardProps?: ComponentProps<typeof Card>
}

export const PathListSkeleton = ({ cardProps }: PathListSkeletonProps) => {
  return (
    <Card {...cardProps} className={cn('min-h-[280px]', cardProps?.className)}>
      <CardHeader className="flex justify-between flex-row items-start">
        <div className="space-y-1.5">
          <CardTitle>Path</CardTitle>
          <CardDescription>Track your journey milestones</CardDescription>
        </div>
        <Skeleton className="h-9 w-9 rounded-md" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {Array.from({ length: SKELETON_ITEMS_COUNT }).map((_, index) => (
            <div key={index} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0 mt-1" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
