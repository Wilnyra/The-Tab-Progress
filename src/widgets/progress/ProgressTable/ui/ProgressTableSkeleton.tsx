import { Skeleton } from '@/shared/ui/Skeleton'

const SKELETON_ROWS = ['a', 'b', 'c', 'd', 'e'] as const

export const ProgressTableSkeleton = () => {
  return (
    <div className="space-y-3">
      {SKELETON_ROWS.map((key) => (
        <div key={key} className="flex items-center gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  )
}
