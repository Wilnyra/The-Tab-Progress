import type { MapState } from '../model/types'
import { parseMapState } from './parseMapState'
import { supabase } from '@/shared/lib/supabase'

export const rpcMapOpen = async (
  tz: string,
  terrain: string | null,
  signal?: AbortSignal,
): Promise<MapState> => {
  const query = supabase.rpc('map_open', { p_tz: tz, p_terrain: terrain })
  const { data, error } = await (signal ? query.abortSignal(signal) : query)
  if (error) throw new Error(error.message)
  return parseMapState(data)
}
