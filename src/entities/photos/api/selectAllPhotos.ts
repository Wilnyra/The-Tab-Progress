import { PhotoData } from '../model/types'
import { supabase } from '@/shared/lib/supabase'

type selectAllPhotosArgs = {
  limit?: number
}

export const selectAllPhotos = async ({
  limit = 9999,
}: selectAllPhotosArgs) => {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .order('id', { ascending: false })
    .limit(limit)

  return {
    data: data as PhotoData[],
    error,
  }
}
