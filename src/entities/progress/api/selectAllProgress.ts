import { ProgressData } from '../model/types'
import { supabase } from '@/shared/lib/supabase'

type selectAllProgressArgs = {
  limit?: number | null
}

export const selectAllProgress = async ({ limit }: selectAllProgressArgs) => {
  const selectPromise = supabase
    .from('progress')
    .select('*')
    .order('id', { ascending: false })

  if (limit) selectPromise.limit(limit)

  const { data, error } = await selectPromise

  return {
    data: data?.reverse() as ProgressData[],
    error,
  }
}
