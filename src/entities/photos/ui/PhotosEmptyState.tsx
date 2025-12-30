import { Camera } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card, CardContent } from '@/shared/ui/Card'

type PhotosEmptyStateProps = {
  rightSlot?: ReactNode
}

export const PhotosEmptyState = ({ rightSlot }: PhotosEmptyStateProps) => {
  return (
    <div className="space-y-4 min-h-[280px]">
      <div className="flex justify-between items-center px-2">
        <div className="space-y-1.5">
          <h2 className="font-semibold leading-none tracking-tight">Photos</h2>
          <p className="text-sm text-muted-foreground">
            Visualize your progress
          </p>
        </div>
        <div className="space-x-2">{rightSlot}</div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Camera className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Capture your progress journey with photos. Click the &quot;+&quot;
              button to upload your first image.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
