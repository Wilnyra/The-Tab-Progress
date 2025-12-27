import type { Dispatch, SetStateAction } from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/shared/ui/Select'

type SelectLimitProps = {
  setLimit: Dispatch<SetStateAction<number | null>>
}

export const SelectLimit = ({ setLimit }: SelectLimitProps) => {
  return (
    <Select
      onValueChange={(limit) => {
        if (limit === 'total') {
          setLimit(null)
          return
        }

        setLimit(Number(limit))
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Limit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7">7 days</SelectItem>
        <SelectItem value="30">30 days</SelectItem>
        <SelectItem value="90">90 days</SelectItem>
        <SelectItem value="180">180 days</SelectItem>
        <SelectItem value="360">360 days</SelectItem>
        <SelectItem value="total">Total</SelectItem>
      </SelectContent>
    </Select>
  )
}
