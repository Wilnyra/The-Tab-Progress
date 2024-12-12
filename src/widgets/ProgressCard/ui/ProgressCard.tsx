import { useState } from 'react'
import { useEffect } from 'react'
import {
  ProgressChart,
  type ProgressData,
  selectAllProgress,
} from '@/entities/progress'
import { AddProgressDialog } from '@/features/progress/AddProgress'

export const ProgressCard = () => {
  const [data, setData] = useState<ProgressData[]>([])
  const [reload, setReload] = useState(false)

  useEffect(() => {
    selectAllProgress({ limit: 30 }).then(({ data }) => {
      setData(data)
    })
  }, [reload])

  return (
    <ProgressChart
      description="Showing 30 days progress"
      rightSlot={
        <AddProgressDialog onComplete={() => setReload((prev) => !prev)} />
      }
      data={data}
      chartContainerClassName="max-h-[200px] w-full"
    />
  )
}
