import { useCallback, useEffect, useRef, type PropsWithChildren } from 'react'
import { formatCellCount } from '../lib/formatNextCell'
import { useTerritoryMap } from '../lib/useTerritoryMap'
import { territoryMapContext } from '../model/territoryMapContext'
import { useToast } from '@/shared/ui/Toast'

type TerritoryMapProviderProps = PropsWithChildren<{
  /** The Map tab is the one on screen — the toast then needs no shortcut. */
  isMapVisible: boolean
  onOpenMap: () => void
}>

/**
 * Owns the territory map state for the whole progress card, so the tab header
 * can show the credits badge while the Days tab is open. Mounting it opens the
 * map profile on the server, which is idempotent and applies the daily decay.
 */
export const TerritoryMapProvider = ({
  isMapVisible,
  onOpenMap,
  children,
}: TerritoryMapProviderProps): JSX.Element => {
  const map = useTerritoryMap()
  const { showToast } = useToast()
  const { state, refetchCount } = map
  const available = state === null ? null : state.credits.available

  // Read the props through refs: a new callback identity must never be able to
  // re-run the notification effect and fire a second toast.
  const isMapVisibleRef = useRef(isMapVisible)
  const onOpenMapRef = useRef(onOpenMap)
  useEffect(() => {
    isMapVisibleRef.current = isMapVisible
    onOpenMapRef.current = onOpenMap
  })

  const previousAvailableRef = useRef<number | null>(null)
  const notifiedRefetchRef = useRef(0)

  const handleOpenMap = useCallback((): void => {
    onOpenMapRef.current()
  }, [])

  useEffect(() => {
    if (available === null) return
    const previous = previousAvailableRef.current
    previousAvailableRef.current = available
    // Only a refetch caused by new progress may notify: the first load has no
    // baseline, and a claim or undo already reports itself in its own toast.
    if (refetchCount === notifiedRefetchRef.current) return
    notifiedRefetchRef.current = refetchCount
    if (previous === null || available <= previous) return
    showToast({
      message: `+${formatCellCount(available - previous)} available`,
      action: isMapVisibleRef.current
        ? undefined
        : { label: 'Open map', onClick: handleOpenMap },
    })
  }, [available, refetchCount, showToast, handleOpenMap])

  return (
    <territoryMapContext.Provider value={map}>
      {children}
    </territoryMapContext.Provider>
  )
}
