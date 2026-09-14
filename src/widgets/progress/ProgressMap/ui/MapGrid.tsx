import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { describeCell } from '../lib/describeCell'
import type { MapDerived } from '@/entities/map'
import { cn } from '@/shared/lib/cn'

type MapGridProps = {
  derived: MapDerived
  selectedIndex: number | null
  onSelect: (index: number | null) => void
  onMove: (stepX: number, stepY: number) => void
  onConfirm: () => void
}

type TooltipPosition = {
  left: number
  top: number
}

const CELL_SIZE = 20
const CELL_PITCH = 21
const CELL_RADIUS = 3
const MARKER_SIZE = 6
// Breathing room inside the viewBox so the selection ring is never clipped.
const VIEW_PAD = 2
const TOOLTIP_OFFSET_PX = 8
const TOOLTIP_EDGE_PX = 96

const KEY_STEPS: Readonly<Record<string, readonly [number, number]>> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
}

const readCellIndex = (target: EventTarget): number | null => {
  if (!(target instanceof Element)) return null
  const raw = target.closest('[data-index]')
  if (!(raw instanceof HTMLElement || raw instanceof SVGElement)) return null
  const value = raw.dataset.index
  return value === undefined ? null : Number(value)
}

const clamp = (value: number, max: number): number =>
  Math.min(max, Math.max(0, value))

const cellClass = (
  char: string,
  isOwned: boolean,
  isLost: boolean,
  isClaimable: boolean,
): string => {
  if (isOwned) return 'fill-chart-2'
  if (isLost) return 'fill-chart-2/20 stroke-chart-2'
  if (char === 'w') return 'fill-muted/40'
  if (isClaimable) return 'fill-chart-2/30'
  return 'fill-muted'
}

export const MapGrid = ({
  derived,
  selectedIndex,
  onSelect,
  onMove,
  onConfirm,
}: MapGridProps): JSX.Element => {
  const { width, height, terrain, owned, lost, claimable } = derived
  // On an empty map every land cell is claimable, so the tint would carry no
  // information — the empty-state copy explains the first claim instead.
  const showClaimable = owned.size > 0
  const svgRef = useRef<SVGSVGElement | null>(null)
  // A touch tap already picked the cell in `pointerdown`; the click that
  // follows must not toggle it straight back off.
  const handledByPointerRef = useRef(false)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<TooltipPosition | null>(null)

  const activeIndex = hoverIndex ?? selectedIndex
  const activeLabel =
    activeIndex === null ? '' : describeCell(derived, activeIndex)

  const viewWidth = width * CELL_PITCH - 1 + VIEW_PAD * 2
  const viewHeight = height * CELL_PITCH - 1 + VIEW_PAD * 2

  const cells = useMemo((): ReactNode[] => {
    const nodes: ReactNode[] = []
    for (let index = 0; index < terrain.length; index += 1) {
      const char = terrain[index]
      const x = (index % width) * CELL_PITCH
      const y = Math.floor(index / width) * CELL_PITCH
      const isLost = lost.has(index)
      nodes.push(
        <rect
          key={`cell-${index}`}
          data-index={index}
          x={x}
          y={y}
          width={CELL_SIZE}
          height={CELL_SIZE}
          rx={CELL_RADIUS}
          strokeWidth={isLost ? 1 : 0}
          strokeDasharray={isLost ? '3 2' : undefined}
          className={cellClass(
            char,
            owned.has(index),
            isLost,
            showClaimable && claimable.has(index),
          )}
        />,
      )
      if (char !== 'h') continue
      nodes.push(
        <rect
          key={`hard-${index}`}
          x={x + (CELL_SIZE - MARKER_SIZE) / 2}
          y={y + (CELL_SIZE - MARKER_SIZE) / 2}
          width={MARKER_SIZE}
          height={MARKER_SIZE}
          rx={1}
          className="pointer-events-none fill-muted-foreground/60"
        />,
      )
    }
    return nodes
  }, [terrain, width, owned, lost, claimable, showClaimable])

  const updateTooltip = useCallback((): void => {
    if (activeIndex === null) {
      setTooltip(null)
      return
    }
    const cell = svgRef.current?.querySelector(`[data-index="${activeIndex}"]`)
    if (!cell) {
      setTooltip(null)
      return
    }
    // Measured, not computed: the viewBox scales the rect with the card width.
    const rect = cell.getBoundingClientRect()
    const center = rect.left + rect.width / 2
    setTooltip({
      left: Math.min(
        Math.max(center, TOOLTIP_EDGE_PX),
        window.innerWidth - TOOLTIP_EDGE_PX,
      ),
      top: rect.top - TOOLTIP_OFFSET_PX,
    })
  }, [activeIndex])

  useLayoutEffect(() => {
    updateTooltip()
  }, [updateTooltip])

  useEffect(() => {
    if (activeIndex === null) return
    window.addEventListener('scroll', updateTooltip, { passive: true })
    window.addEventListener('resize', updateTooltip)
    return () => {
      window.removeEventListener('scroll', updateTooltip)
      window.removeEventListener('resize', updateTooltip)
    }
  }, [activeIndex, updateTooltip])

  // A fingertip covers several cells at this scale, so a touch picks the cell
  // whose centre is nearest the contact point instead of the rect under it.
  const findNearestIndex = useCallback(
    (clientX: number, clientY: number): number | null => {
      const svg = svgRef.current
      if (!svg) return null
      const box = svg.getBoundingClientRect()
      if (box.width === 0 || box.height === 0) return null
      // Mirrors `xMidYMid meet`: one uniform scale, content centred.
      const scale = Math.min(box.width / viewWidth, box.height / viewHeight)
      const offsetX = (box.width - viewWidth * scale) / 2
      const offsetY = (box.height - viewHeight * scale) / 2
      const localX = (clientX - box.left - offsetX) / scale - VIEW_PAD
      const localY = (clientY - box.top - offsetY) / scale - VIEW_PAD
      const x = clamp(
        Math.round((localX - CELL_SIZE / 2) / CELL_PITCH),
        width - 1,
      )
      const y = clamp(
        Math.round((localY - CELL_SIZE / 2) / CELL_PITCH),
        height - 1,
      )
      return y * width + x
    },
    [viewWidth, viewHeight, width, height],
  )

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>): void => {
      handledByPointerRef.current = false
      if (event.pointerType === 'mouse') return
      // No `preventDefault`: the page must still scroll from a drag that
      // starts on the grid.
      const index = findNearestIndex(event.clientX, event.clientY)
      if (index === null) return
      handledByPointerRef.current = true
      onSelect(index === selectedIndex ? null : index)
    },
    [findNearestIndex, onSelect, selectedIndex],
  )

  const handlePointerOver = useCallback(
    (event: PointerEvent<HTMLDivElement>): void => {
      if (event.pointerType !== 'mouse') return
      setHoverIndex(readCellIndex(event.target))
    },
    [],
  )

  const handlePointerLeave = useCallback(
    (event: PointerEvent<HTMLDivElement>): void => {
      if (event.pointerType === 'mouse') setHoverIndex(null)
    },
    [],
  )

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>): void => {
      if (handledByPointerRef.current) {
        handledByPointerRef.current = false
        return
      }
      const index = readCellIndex(event.target)
      if (index === null) {
        onSelect(null)
        return
      }
      onSelect(index === selectedIndex ? null : index)
    },
    [onSelect, selectedIndex],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>): void => {
      if (event.key === 'Escape') {
        onSelect(null)
        return
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onConfirm()
        return
      }
      const step = KEY_STEPS[event.key]
      if (!step) return
      event.preventDefault()
      onMove(step[0], step[1])
    },
    [onSelect, onConfirm, onMove],
  )

  const handleBlur = useCallback((): void => {
    setHoverIndex(null)
  }, [])

  const selectionX =
    selectedIndex === null ? 0 : (selectedIndex % width) * CELL_PITCH
  const selectionY =
    selectedIndex === null ? 0 : Math.floor(selectedIndex / width) * CELL_PITCH

  return (
    <div className="space-y-2">
      <div
        role="group"
        tabIndex={0}
        aria-label="Territory map. Arrow keys move the selection, Enter claims the selected cell."
        className={cn(
          // The square grows with the card, but never past the viewport
          // height — a map taller than the screen is not "fully visible".
          'mx-auto w-full max-w-[70vh] rounded-md border p-1',
          'outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
        onPointerDown={handlePointerDown}
        onPointerOver={handlePointerOver}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      >
        {/* The whole grid always fits: the viewBox scales it to the card. */}
        <svg
          ref={svgRef}
          viewBox={`${-VIEW_PAD} ${-VIEW_PAD} ${viewWidth} ${viewHeight}`}
          preserveAspectRatio="xMidYMid meet"
          role="presentation"
          className="block aspect-square w-full"
        >
          {cells}
          {selectedIndex === null ? null : (
            <rect
              x={selectionX - 1}
              y={selectionY - 1}
              width={CELL_SIZE + 2}
              height={CELL_SIZE + 2}
              rx={CELL_RADIUS + 1}
              strokeWidth={2}
              className="pointer-events-none fill-none stroke-foreground"
            />
          )}
        </svg>
      </div>

      {activeLabel && tooltip ? (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md"
          style={{ left: tooltip.left, top: tooltip.top }}
        >
          {activeLabel}
        </div>
      ) : null}
    </div>
  )
}
