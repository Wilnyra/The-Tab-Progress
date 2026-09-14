import { createContext } from 'react'
import type { UseTerritoryMapResult } from '../lib/useTerritoryMap'

export type TerritoryMapContextValue = UseTerritoryMapResult

export const territoryMapContext =
  createContext<TerritoryMapContextValue | null>(null)
