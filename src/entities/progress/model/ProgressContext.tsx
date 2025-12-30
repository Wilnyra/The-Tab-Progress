import { createContext, useMemo, useState } from 'react'
import type { Dispatch, FC, PropsWithChildren, SetStateAction } from 'react'
import type { ProgressData } from './types'

type ContextValue = {
  progress: ProgressData[]
  setProgress: Dispatch<SetStateAction<ContextValue['progress']>>
  progressReload: number
  setProgressReload: Dispatch<SetStateAction<ContextValue['progressReload']>>
}

export type ProgressContextProviderProps = Partial<
  Omit<ContextValue, 'setProgress' | 'setProgressReload'>
>

export const progressContext = createContext<ContextValue>({
  progress: [],
  setProgress: () => [],
  progressReload: 0,
  setProgressReload: () => null,
})

export const ProgressContextProvider: FC<
  PropsWithChildren<ProgressContextProviderProps>
> = ({ children, progress: initial = [] }) => {
  const [progress, setProgress] = useState<ProgressData[]>(initial)
  const [progressReload, setProgressReload] = useState(0)

  const value = useMemo(
    () => ({
      progress,
      setProgress,
      progressReload,
      setProgressReload,
    }),
    [progress, progressReload]
  )

  return (
    <progressContext.Provider value={value}>
      {children}
    </progressContext.Provider>
  )
}
