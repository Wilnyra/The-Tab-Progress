import type { PathData } from '../model/types'
import { supabase } from '@/shared/lib/supabase'

const PAGE_SIZE = 1000

export const selectAllPathRows = async (
  signal?: AbortSignal,
): Promise<{ data: PathData[]; error: Error | null }> => {
  const rows: PathData[] = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const query = supabase
      .from('path')
      .select('*')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    const { data, error } = await (signal ? query.abortSignal(signal) : query)
    if (error) return { data: rows, error: new Error(error.message) }

    const page = (data ?? []) as PathData[]
    rows.push(...page)
    if (page.length < PAGE_SIZE) return { data: rows, error: null }
  }
}
