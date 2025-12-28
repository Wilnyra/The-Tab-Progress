import type { PathData } from '../model/types'
import { supabase } from '@/shared/lib/supabase'

export const updatePath = async (
  id: string,
  updates: Partial<Pick<PathData, 'step'>>,
) => {
  const { data, error } = await supabase
    .from('path')
    .update(updates)
    .eq('id', id)

  return {
    data,
    error,
  }
}
