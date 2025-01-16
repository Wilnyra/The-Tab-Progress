import {
  createContext,
  useState,
  type Dispatch,
  type FC,
  type PropsWithChildren,
  type SetStateAction,
} from 'react'
import type { ProgressData } from './types'

type ContextValue = {
  lastProgress: ProgressData | null
  setLastProgress: Dispatch<SetStateAction<ContextValue['lastProgress']>>
  progressReload: boolean
  setProgressReload: Dispatch<SetStateAction<ContextValue['progressReload']>>
}

export type ProgressContextProviderProps = Partial<
  Omit<ContextValue, 'setLastProgress' | 'setProgressReload'>
>

export const progressContext = createContext<ContextValue>({
  lastProgress: null,
  setLastProgress: () => null,
  progressReload: false,
  setProgressReload: () => null,
})

export const ProgressContextProvider: FC<
  PropsWithChildren<ProgressContextProviderProps>
> = ({ children, lastProgress: initial = null }) => {
  const [lastProgress, setLastProgress] = useState<ProgressData | null>(initial)
  const [progressReload, setProgressReload] = useState(false)

  const value = {
    lastProgress,
    setLastProgress,
    progressReload,
    setProgressReload,
  }

  return (
    <progressContext.Provider value={value}>
      {children}
    </progressContext.Provider>
  )
}
