import { TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ProgressHeader } from './ProgressHeader'
import { getProgressPath } from '@/shared/lib/routePaths'
import { Card, CardContent } from '@/shared/ui/Card'

type ProgressEmptyStateProps = {
  rightSlot?: ReactNode
  toolbar?: ReactNode
  description?: ReactNode
}

export const ProgressEmptyState = ({
  rightSlot,
  toolbar,
  description,
}: ProgressEmptyStateProps) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isLocationProgress = pathname === getProgressPath()

  const handleHeaderClick = (): void => {
    navigate(getProgressPath())
  }

  return (
    <Card variant="section" className="min-h-[320px]">
      <ProgressHeader
        description={description}
        rightSlot={rightSlot}
        toolbar={toolbar}
        onClick={isLocationProgress ? undefined : handleHeaderClick}
      />
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
