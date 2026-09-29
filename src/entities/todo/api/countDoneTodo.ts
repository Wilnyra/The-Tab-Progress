import { supabase } from '@/shared/lib/supabase'

export const countDoneTodo = async (
  signal?: AbortSignal,
): Promise<{ data: number; error: Error | null }> => {
  const query = supabase
    .from('todo')
    .select('id', { count: 'exact', head: true })
    .eq('is_done', true)

  const { count, error } = await (signal ? query.abortSignal(signal) : query)
  if (error) return { data: 0, error: new Error(error.message) }
  return { data: count ?? 0, error: null }
}
