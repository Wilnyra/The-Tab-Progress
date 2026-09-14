import { Skeleton } from '@/shared/ui/Skeleton'

export const ProgressMapSkeleton = (): JSX.Element => (
  <div className="space-y-3" aria-busy="true">
    <Skeleton className="h-4 w-48" />
    <Skeleton className="h-4 w-32" />
    <Skeleton className="mx-auto aspect-square w-full max-w-[70vh] rounded-md" />
    <Skeleton className="h-14 w-full rounded-md" />
  </div>
)
