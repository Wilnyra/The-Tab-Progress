import type { PropsWithChildren } from 'react'
import { useCountProgressState } from '../lib/useCountProgressState'
import { CountProgressContext } from '../model/countProgressContext'

export const CountProgressProvider = ({
  children,
}: PropsWithChildren): JSX.Element => {
  const value = useCountProgressState()

  return (
    <CountProgressContext.Provider value={value}>
      {children}
    </CountProgressContext.Provider>
  )
}
