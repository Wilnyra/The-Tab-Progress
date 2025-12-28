import type { PathData } from '../model/types'
import { supabase } from '@/shared/lib/supabase'

export const insertPath = async (
  step: PathData['step'],
  userId: string,
) => {
  const { data, error } = await supabase
    .from('path')
    .insert({ step, user_id: userId })

  return {
    data,
    error,
  }
}
