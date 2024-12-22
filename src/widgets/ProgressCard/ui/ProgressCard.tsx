import { useState, useEffect } from 'react'
import {
  ProgressChart,
  type ProgressData,
  selectAllProgress,
} from '@/entities/progress'
import { AddProgressDialog } from '@/features/progress/AddProgress'
import { SelectLimit } from '@/features/progress/SelectLimit'

type ProgressCardProps = {
  selectLimit?: boolean
}

export const ProgressCard = ({ selectLimit }: ProgressCardProps) => {
  const [limit, setLimit] = useState<number | null>(30)
  const [data, setData] = useState<ProgressData[]>([])
  const [reload, setReload] = useState(false)

  useEffect(() => {
    selectAllProgress({ limit }).then(({ data }) => {
      setData(data)
    })
  }, [reload, limit])

  return (
    <ProgressChart
      description={
        limit ? `Showing ${limit} days progress` : 'Showing all progress'
      }
      rightSlot={
        <div className="flex gap-4">
          {selectLimit ? <SelectLimit setLimit={setLimit} /> : null}
          <AddProgressDialog onComplete={() => setReload((prev) => !prev)} />
        </div>
      }
      data={data}
      chartContainerClassName="max-h-[200px] w-full"
    />
  )
}
