import { ProgressData } from '../model/types'
import { supabase } from '@/shared/lib/supabase'

export const updateProgress = async (
  id: string,
  updates: Partial<ProgressData>,
) => {
  const { data, error } = await supabase
    .from('progress')
    .update(updates)
    .eq('id', id)

  return {
    data,
    error,
  }
}
