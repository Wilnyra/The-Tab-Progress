import type { MouseEvent, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card'

type ProgressHeaderProps = {
  description?: ReactNode
  rightSlot?: ReactNode
  toolbar?: ReactNode
  onClick?: () => void
}

const stopPropagation = (event: MouseEvent<HTMLDivElement>): void => {
  event.stopPropagation()
}

export const ProgressHeader = ({
  description,
  rightSlot,
  toolbar,
  onClick,
}: ProgressHeaderProps): JSX.Element => (
  <CardHeader
    className={cn(
      'flex-row flex-wrap items-center justify-between gap-4 space-y-0',
      onClick ? 'cursor-pointer' : '',
    )}
    onClick={onClick}
  >
    <div className="min-w-0 flex-1 space-y-1.5">
      <CardTitle>Progress</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </div>
    {toolbar ? (
      <div
        className="order-last w-full md:order-none md:w-auto"
        onClick={stopPropagation}
      >
        {toolbar}
      </div>
    ) : null}
    {rightSlot ? <div onClick={stopPropagation}>{rightSlot}</div> : null}
  </CardHeader>
)
