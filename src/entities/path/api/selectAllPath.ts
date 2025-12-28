import type { PathData } from '../model/types'
import { supabase } from '@/shared/lib/supabase'

type selectAllPathArgs = {
  limit?: number
}

export const selectAllPath = async ({ limit = 5 }: selectAllPathArgs) => {
  const { data, error } = await supabase
    .from('path')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  return {
    data: data as PathData[],
    error,
  }
}
