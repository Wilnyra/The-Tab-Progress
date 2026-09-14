import { cn } from '@/shared/lib/cn'

type LegendItem = {
  label: string
  swatch: string
}

const ITEMS: readonly LegendItem[] = [
  { label: 'Yours', swatch: 'bg-chart-2' },
  {
    label: 'Lost',
    swatch: 'bg-chart-2/20 border border-dashed border-chart-2',
  },
  {
    label: 'Hard · 3',
    swatch: 'bg-muted ring-2 ring-inset ring-muted-foreground/60',
  },
  { label: 'Water', swatch: 'bg-muted/40 border' },
]

export const MapLegend = (): JSX.Element => (
  <ul
    className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
    aria-label="Map legend"
  >
    {ITEMS.map((item) => (
      <li key={item.label} className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className={cn('size-3 shrink-0 rounded-sm', item.swatch)}
        />
        {item.label}
      </li>
    ))}
  </ul>
)
