import type { ComponentProps, ReactElement } from 'react'
import { CharacterFigureSkeleton } from './CharacterFigureSkeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'

type ProgressInRowSkeletonProps = {
  cardProps?: ComponentProps<typeof Card>
}

export const ProgressInRowSkeleton = ({
  cardProps,
}: ProgressInRowSkeletonProps): ReactElement => {
  return (
    <Card {...cardProps} className="min-h-[200px]">
      <CardHeader>
        <CardTitle>Progress In Row</CardTitle>
        <CardDescription>Do not interrupt the duration</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <CharacterFigureSkeleton />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-4 w-full max-w-48" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
