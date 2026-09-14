import { formatCellCount, type MapCellAction } from '@/entities/map'
import { Button } from '@/shared/ui/Button'

type ClaimBarProps = {
  action: MapCellAction | null
  isSubmitting: boolean
  onConfirm: () => void
}

const HINT = 'Select a cell, then confirm below.'

const buildLabel = (action: MapCellAction): string => {
  if (action.kind === 'blocked') return action.reason
  const verb = action.kind === 'restore' ? 'Restore' : 'Claim'
  return `${verb} for ${formatCellCount(action.cost)}`
}

export const ClaimBar = ({
  action,
  isSubmitting,
  onConfirm,
}: ClaimBarProps): JSX.Element => {
  const isDisabled =
    action === null || action.kind === 'blocked' || isSubmitting
  const isRestore = action?.kind === 'restore'
  const idleLabel = isRestore ? 'Restore' : 'Claim'
  const busyLabel = isRestore ? 'Restoring…' : 'Claiming…'

  return (
    <div
      className="flex min-h-14 items-center justify-between gap-3 rounded-md border bg-card px-3 py-2"
      aria-live="polite"
    >
      <p
        className={
          action === null || action.kind === 'blocked'
            ? 'text-sm text-muted-foreground'
            : 'text-sm font-medium'
        }
      >
        {action === null ? HINT : buildLabel(action)}
      </p>
      <Button
        type="button"
        onClick={onConfirm}
        disabled={isDisabled}
        className="shrink-0"
      >
        {isSubmitting ? busyLabel : idleLabel}
      </Button>
    </div>
  )
}
