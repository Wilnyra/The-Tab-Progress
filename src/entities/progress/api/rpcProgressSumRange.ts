import { supabase } from '@/shared/lib/supabase'

export const rpcProgressSumRange = async (start: Date, end: Date) => {
  const { data, error } = await supabase.rpc('progress_sum_range', {
    start_ts: start.toISOString(),
    end_ts: end.toISOString(),
  })

  const sum = typeof data === 'number' ? data : Number(data ?? 0)

  return {
    data: sum,
    error,
  }
}
