import type { ProgressEvent } from '../model/types'
import { supabase } from '@/shared/lib/supabase'

type RawProgressRow = {
  id: string
  created_at: string
  user_id: string
  comment?: string | null
  duration_seconds?: number | null
  value?: number | null
}

const normalize = (row: RawProgressRow): ProgressEvent => ({
  id: row.id,
  created_at: row.created_at,
  user_id: row.user_id,
  comment: row.comment ?? null,
  duration_seconds:
    row.duration_seconds ?? (row.value ? row.value * 60 : 0),
})

export const selectEventsBetween = async (start: Date, end: Date) => {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString())
    .order('created_at', { ascending: true })

  return {
    data: (data ?? []).map(normalize as (row: unknown) => ProgressEvent),
    error,
  }
}
