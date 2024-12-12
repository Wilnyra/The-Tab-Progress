import { supabase } from '@/shared/lib/supabase'

export const insertPhoto = async (url: string, userId: string) => {
  const { data, error } = await supabase
    .from('photos')
    .insert({ url, user_id: userId })

  return {
    data,
    error,
  }
}
