import { createContext, useMemo, useState } from 'react'
import type { Dispatch, FC, PropsWithChildren, SetStateAction } from 'react'
import type { ProgressData } from './types'

type ContextValue = {
  progress: ProgressData[]
  setProgress: Dispatch<SetStateAction<ContextValue['progress']>>
  progressReload: number
  setProgressReload: Dispatch<SetStateAction<ContextValue['progressReload']>>
  isLoading: boolean
  setIsLoading: Dispatch<SetStateAction<boolean>>
}

export type ProgressContextProviderProps = Partial<
  Omit<ContextValue, 'setProgress' | 'setProgressReload' | 'setIsLoading'>
>

export const progressContext = createContext<ContextValue>({
  progress: [],
  setProgress: () => [],
  progressReload: 0,
  setProgressReload: () => null,
  isLoading: true,
  setIsLoading: () => null,
})

export const ProgressContextProvider: FC<
  PropsWithChildren<ProgressContextProviderProps>
> = ({ children, progress: initial = [] }) => {
  const [progress, setProgress] = useState<ProgressData[]>(initial)
  const [progressReload, setProgressReload] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const value = useMemo(
    () => ({
      progress,
      setProgress,
      progressReload,
      setProgressReload,
      isLoading,
      setIsLoading,
    }),
    [progress, progressReload, isLoading]
  )

  return (
    <progressContext.Provider value={value}>
      {children}
    </progressContext.Provider>
  )
}
