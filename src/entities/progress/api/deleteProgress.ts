import type { PostgrestError } from '@supabase/supabase-js'
import { supabase } from '@/shared/lib/supabase'

export const deleteProgress = async (
  id: string,
): Promise<{ error: PostgrestError | null }> => {
  const { error } = await supabase.from('progress').delete().eq('id', id)
  return { error }
}
