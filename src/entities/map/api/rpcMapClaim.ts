import type { MapState } from '../model/types'
import { parseMapState } from './parseMapState'
import { supabase } from '@/shared/lib/supabase'

export const rpcMapClaim = async (
  tz: string,
  x: number,
  y: number,
): Promise<MapState> => {
  const { data, error } = await supabase.rpc('map_claim', {
    p_tz: tz,
    p_x: x,
    p_y: y,
  })
  if (error) throw new Error(error.message)
  return parseMapState(data)
}
