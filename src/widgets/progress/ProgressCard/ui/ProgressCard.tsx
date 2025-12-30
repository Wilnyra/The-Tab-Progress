import { useState, useEffect, useContext } from 'react'
import {
  ProgressChart,
  progressContext,
  type ProgressData,
  selectAllProgress,
} from '@/entities/progress'
import { AddProgressDialog } from '@/features/progress/AddProgress'
import { SelectLimit } from '@/features/progress/SelectLimit'

type ProgressCardProps = {
  selectLimit?: boolean
}

export const ProgressCard = ({ selectLimit }: ProgressCardProps) => {
  const { setProgress, progressReload, setIsLoading } =
    useContext(progressContext)
  const [limit, setLimit] = useState<number | null>(30)
  const [data, setData] = useState<ProgressData[]>([])
  const [reload, setReload] = useState(false)
  const [isLocalLoading, setIsLocalLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    setIsLocalLoading(true)
    selectAllProgress({ limit })
      .then(({ data }) => {
        setData(data)
        setProgress(data || [])
      })
      .finally(() => {
        setIsLoading(false)
        setIsLocalLoading(false)
      })
  }, [reload, limit, progressReload, setProgress, setIsLoading])

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
      isLoading={isLocalLoading}
    />
  )
}
