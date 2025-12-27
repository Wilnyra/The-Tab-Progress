import type { TodoData } from '../model/types'
import { supabase } from '@/shared/lib/supabase'

type selectAllTodoArgs = {
  limit?: number
}

export const selectAllTodo = async ({ limit = 9999 }: selectAllTodoArgs) => {
  const { data, error } = await supabase
    .from('todo')
    .select('*')
    .eq('is_done', false)
    .order('id', { ascending: false })
    .limit(limit)

  return {
    data: data?.reverse() as TodoData[],
    error,
  }
}
