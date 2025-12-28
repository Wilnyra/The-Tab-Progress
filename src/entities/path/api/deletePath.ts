import { supabase } from '@/shared/lib/supabase'

export const deletePath = async (id: string) => {
  const { data, error } = await supabase.from('path').delete().eq('id', id)

  return {
    data,
    error,
  }
}
