import type { Dispatch, SetStateAction } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/Tabs'

type RangeOption = {
  value: string
  label: string
  limit: number | null
}

const RANGE_OPTIONS: readonly RangeOption[] = [
  { value: '7', label: '7D', limit: 7 },
  { value: '30', label: '30D', limit: 30 },
  { value: '90', label: '90D', limit: 90 },
  { value: '180', label: '180D', limit: 180 },
  { value: '360', label: '1Y', limit: 360 },
  { value: 'total', label: 'All', limit: null },
]

const toTabValue = (limit: number | null): string =>
  limit === null ? 'total' : String(limit)

type SelectLimitProps = {
  value: number | null
  setLimit: Dispatch<SetStateAction<number | null>>
}

export const SelectLimit = ({
  value,
  setLimit,
}: SelectLimitProps): JSX.Element => {
  const handleValueChange = (next: string): void => {
    const option = RANGE_OPTIONS.find((item) => item.value === next)
    if (option) setLimit(option.limit)
  }

  return (
    <Tabs value={toTabValue(value)} onValueChange={handleValueChange}>
      <TabsList
        aria-label="Chart range"
        className="grid h-auto w-full grid-cols-6 p-0.5 md:inline-grid md:w-auto"
      >
        {RANGE_OPTIONS.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            className="min-h-11 px-2 md:min-h-8 md:px-3"
          >
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
