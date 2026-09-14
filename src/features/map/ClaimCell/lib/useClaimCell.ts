import { useCallback, useEffect, useRef, useState } from 'react'
import {
  describeCellAction,
  getMapFocusIndex,
  type MapActionResult,
  type MapCellAction,
  type MapDerived,
} from '@/entities/map'
import { useToast } from '@/shared/ui/Toast'

type UseClaimCellParams = {
  derived: MapDerived
  claim: (x: number, y: number) => Promise<MapActionResult>
  undo: (eventId: number) => Promise<MapActionResult>
}

export type UseClaimCellResult = {
  selectedIndex: number | null
  action: MapCellAction | null
  isSubmitting: boolean
  selectCell: (index: number | null) => void
  moveSelection: (stepX: number, stepY: number) => void
  confirmSelection: () => void
  clearSelection: () => void
}

export const useClaimCell = ({
  derived,
  claim,
  undo,
}: UseClaimCellParams): UseClaimCellResult => {
  const { showToast } = useToast()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const mountedRef = useRef(true)
  // The ref, not the state, guards against double submits: state updates are
  // async, so two fast taps could both pass an `isSubmitting === false` check.
  const isBusyRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const { width, height } = derived
  const cellCount = width * height

  useEffect(() => {
    setSelectedIndex((current) =>
      current !== null && current >= cellCount ? null : current,
    )
  }, [cellCount])

  const action =
    selectedIndex === null ? null : describeCellAction(derived, selectedIndex)

  const selectCell = useCallback((index: number | null): void => {
    setSelectedIndex(index)
  }, [])

  const clearSelection = useCallback((): void => {
    setSelectedIndex(null)
  }, [])

  const moveSelection = useCallback(
    (stepX: number, stepY: number): void => {
      setSelectedIndex((current) => {
        if (current === null) return getMapFocusIndex(derived)
        const x = Math.min(width - 1, Math.max(0, (current % width) + stepX))
        const y = Math.min(
          height - 1,
          Math.max(0, Math.floor(current / width) + stepY),
        )
        return y * width + x
      })
    },
    [derived, width, height],
  )

  const runUndo = useCallback(
    (eventId: number): void => {
      void undo(eventId).then((result) => {
        if (result.ok) {
          showToast({ message: 'Claim undone' })
          return
        }
        showToast({ message: result.message, variant: 'error' })
      })
    },
    [undo, showToast],
  )

  const confirmSelection = useCallback((): void => {
    if (selectedIndex === null || isBusyRef.current) return
    const current = describeCellAction(derived, selectedIndex)
    if (current.kind === 'blocked') {
      showToast({ message: current.reason, variant: 'error' })
      return
    }

    const x = selectedIndex % width
    const y = Math.floor(selectedIndex / width)
    isBusyRef.current = true
    setIsSubmitting(true)

    void claim(x, y).then((result) => {
      isBusyRef.current = false
      if (!mountedRef.current) return
      setIsSubmitting(false)
      if (!result.ok) {
        showToast({ message: result.message, variant: 'error' })
        return
      }

      setSelectedIndex(null)
      const claimed = result.state.cells.find(
        (cell) => cell.x === x && cell.y === y,
      )
      const message =
        current.kind === 'restore' ? 'Cell restored' : 'Cell claimed'
      if (!claimed) {
        showToast({ message })
        return
      }
      const eventId = claimed.eventId
      showToast({
        message,
        action: {
          label: 'Undo',
          onClick: () => runUndo(eventId),
        },
      })
    })
  }, [selectedIndex, derived, width, claim, showToast, runUndo])

  return {
    selectedIndex,
    action,
    isSubmitting,
    selectCell,
    moveSelection,
    confirmSelection,
    clearSelection,
  }
}
