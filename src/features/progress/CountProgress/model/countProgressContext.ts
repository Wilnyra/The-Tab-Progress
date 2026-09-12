import { createContext } from 'react'

export type CountProgressValue = {
  count: number
  isCounting: boolean
  description: string
  setDescription: (next: string) => void
  startedAt: Date | null
  startCount: (initialComment?: string) => void
  stopCount: () => void
  cancelCount: () => void
}

export const CountProgressContext = createContext<CountProgressValue | null>(
  null,
)
