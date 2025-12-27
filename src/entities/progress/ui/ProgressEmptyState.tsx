import { TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import { getProgressPath } from '@/shared/lib/routePaths'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/Card'

type ProgressEmptyStateProps = {
  rightSlot?: ReactNode
  description?: ReactNode
}

export const ProgressEmptyState = ({
  rightSlot,
  description,
}: ProgressEmptyStateProps) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isLocationProgress = pathname === getProgressPath()

  return (
    <Card>
      <CardHeader
        className={cn('flex justify-between flex-row items-start', {
          'cursor-pointer': !isLocationProgress,
        })}
        onClick={() => {
          if (!isLocationProgress) navigate(getProgressPath())
        }}
      >
        <div className="space-y-1.5">
          <CardTitle>Progress</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </div>

        {rightSlot}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <TrendingUp className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No progress yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Start tracking your progress by adding your first record. Click the
            &quot;+&quot; button to get started.
          </p>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-chart-1" />
              <span>Track daily progress</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-chart-2" />
              <span>Visualize trends</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
