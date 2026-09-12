import type { ProgressEvent } from '../model/types'
import { supabase } from '@/shared/lib/supabase'

const PAGE_SIZE = 1000

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

export const selectEventsBetween = async (
  start: Date,
  end: Date,
  signal?: AbortSignal,
) => {
  const events: ProgressEvent[] = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const query = supabase
      .from('progress')
      .select('*')
      .gte('created_at', start.toISOString())
      .lt('created_at', end.toISOString())
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    const { data, error } = await (signal ? query.abortSignal(signal) : query)
    if (error) return { data: events, error }

    const rows = data ?? []
    events.push(...rows.map(normalize as (row: unknown) => ProgressEvent))
    if (rows.length < PAGE_SIZE) return { data: events, error: null }
  }
}
