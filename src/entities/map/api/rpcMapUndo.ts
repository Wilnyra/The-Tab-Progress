import type { MapState } from '../model/types'
import { parseMapState } from './parseMapState'
import { supabase } from '@/shared/lib/supabase'

export const rpcMapUndo = async (
  tz: string,
  eventId: number,
): Promise<MapState> => {
  const { data, error } = await supabase.rpc('map_undo', {
    p_tz: tz,
    p_event_id: eventId,
  })
  if (error) throw new Error(error.message)
  return parseMapState(data)
}
