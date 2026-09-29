import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type RailRowProps = {
  marker: ReactNode
  children: ReactNode
  className?: string
}

export const RailRow = ({
  marker,
  children,
  className,
}: RailRowProps): JSX.Element => (
  <div className={cn('flex gap-3', className)}>
    <div className="relative z-10 flex w-6 shrink-0 justify-center">
      {marker}
    </div>
    <div className="min-w-0 flex-1">{children}</div>
  </div>
)

export const RailLine = (): JSX.Element => (
  <div
    aria-hidden="true"
    className="absolute bottom-12 left-3 top-2.5 w-px -translate-x-1/2 bg-border"
  />
)
