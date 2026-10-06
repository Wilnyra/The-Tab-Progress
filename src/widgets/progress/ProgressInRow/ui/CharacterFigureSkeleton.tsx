import type { ReactElement } from 'react'
import { Skeleton } from '@/shared/ui/Skeleton'

// Same box as the character: viewBox 120x160 rendered 120px wide.
export const CharacterFigureSkeleton = (): ReactElement => (
  <Skeleton className="h-40 w-[120px] shrink-0" />
)
