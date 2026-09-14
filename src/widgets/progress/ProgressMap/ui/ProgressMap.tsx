import { useCallback, useEffect, useMemo, useRef } from 'react'
import { MapGrid } from './MapGrid'
import { MapLegend } from './MapLegend'
import { ProgressMapSkeleton } from './ProgressMapSkeleton'
import {
  deriveMap,
  formatCellCount,
  formatNextCell,
  useTerritoryMapContext,
} from '@/entities/map'
import { ClaimBar, useClaimCell } from '@/features/map/ClaimCell'
import { Button } from '@/shared/ui/Button'

const EMPTY_INTRO =
  'Your map is empty. Every full hour of progress in a day earns one cell.'
const EMPTY_CALL = 'Tap any land cell to claim your first territory.'

export const ProgressMap = (): JSX.Element => {
  const { state, isLoading, error, claim, undo, reload } =
    useTerritoryMapContext()
  const derived = useMemo(() => deriveMap(state), [state])
  const containerRef = useRef<HTMLDivElement | null>(null)

  const {
    selectedIndex,
    action,
    isSubmitting,
    selectCell,
    moveSelection,
    confirmSelection,
    clearSelection,
  } = useClaimCell({ derived, claim, undo })

  useEffect(() => {
    if (selectedIndex === null) return
    const handleOutsidePointer = (event: Event): void => {
      const node = containerRef.current
      const target = event.target
      if (!node || !(target instanceof Node) || node.contains(target)) return
      clearSelection()
    }
    document.addEventListener('pointerdown', handleOutsidePointer)
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer)
    }
  }, [selectedIndex, clearSelection])

  const handleRetry = useCallback((): void => {
    reload()
  }, [reload])

  if (!state) {
    if (error) {
      return (
        <div className="space-y-3 py-6 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button type="button" variant="outline" onClick={handleRetry}>
            Try again
          </Button>
        </div>
      )
    }
    if (isLoading) return <ProgressMapSkeleton />
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        The map is not available right now.
      </p>
    )
  }

  const { available, todaySeconds } = state.credits
  const nextCell = formatNextCell(todaySeconds)
  const ownedCount = derived.owned.size
  const lostCount = derived.lost.size
  const isEmpty = ownedCount === 0 && lostCount === 0

  return (
    <div ref={containerRef} className="space-y-3">
      <div className="space-y-1">
        <p className="text-sm font-medium tabular-nums">
          {`${formatCellCount(available)} available · next in ${nextCell}`}
        </p>
        {isEmpty ? null : (
          <p className="text-sm tabular-nums text-muted-foreground">
            {lostCount > 0
              ? `${formatCellCount(ownedCount)} · ${lostCount} lost`
              : formatCellCount(ownedCount)}
          </p>
        )}
      </div>

      {isEmpty ? (
        <p className="text-sm text-muted-foreground">
          {`${EMPTY_INTRO} Next cell in ${nextCell}.`}
          {available >= 1 ? ` ${EMPTY_CALL}` : ''}
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive">
          Could not refresh the map. Showing the last loaded state.
        </p>
      ) : null}

      <MapGrid
        derived={derived}
        selectedIndex={selectedIndex}
        onSelect={selectCell}
        onMove={moveSelection}
        onConfirm={confirmSelection}
      />

      <ClaimBar
        action={action}
        isSubmitting={isSubmitting}
        onConfirm={confirmSelection}
      />

      <MapLegend />
    </div>
  )
}
