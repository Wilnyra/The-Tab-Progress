import { useContext } from 'react'
import {
  territoryMapContext,
  type TerritoryMapContextValue,
} from '../model/territoryMapContext'

export const useTerritoryMapContext = (): TerritoryMapContextValue => {
  const value = useContext(territoryMapContext)
  if (!value) {
    throw new Error('useTerritoryMapContext requires a TerritoryMapProvider')
  }
  return value
}
