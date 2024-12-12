import { ProgressData } from '../model/types'
import { supabase } from '@/shared/lib/supabase'

type selectAllProgressArgs = {
  limit?: number
}

export const selectAllProgress = async ({
  limit = 9999,
}: selectAllProgressArgs) => {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .order('id', { ascending: false })
    .limit(limit)

  return {
    data: data?.reverse() as ProgressData[],
    error,
  }
}
