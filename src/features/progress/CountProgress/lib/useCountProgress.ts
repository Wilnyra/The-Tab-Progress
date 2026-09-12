import { useContext } from 'react'
import {
  CountProgressContext,
  type CountProgressValue,
} from '../model/countProgressContext'

export const useCountProgress = (): CountProgressValue => {
  const context = useContext(CountProgressContext)
  if (!context) {
    throw new Error(
      'useCountProgress must be used within <CountProgressProvider>',
    )
  }
  return context
}
