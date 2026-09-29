import { supabase } from '@/shared/lib/supabase'

const PAGE_SIZE = 1000

export const selectPhotoDates = async (
  signal?: AbortSignal,
): Promise<{ data: string[]; error: Error | null }> => {
  const dates: string[] = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const query = supabase
      .from('photos')
      .select('created_at')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    const { data, error } = await (signal ? query.abortSignal(signal) : query)
    if (error) return { data: dates, error: new Error(error.message) }

    const rows = data ?? []
    for (const row of rows) {
      if (typeof row.created_at === 'string') dates.push(row.created_at)
    }
    if (rows.length < PAGE_SIZE) return { data: dates, error: null }
  }
}
