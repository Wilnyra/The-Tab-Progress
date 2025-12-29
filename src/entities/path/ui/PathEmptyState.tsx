import { Trophy } from 'lucide-react'
import type { ReactNode } from 'react'

type PathEmptyStateProps = {
  rightSlot?: ReactNode
}

export const PathEmptyState = ({ rightSlot }: PathEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Trophy className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No achievements yet</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Start tracking your journey by recording your achievements and
        milestones. Click the &quot;+&quot; button to add your first
        achievement.
      </p>
      {rightSlot ? <div>{rightSlot}</div> : null}
    </div>
  )
}
