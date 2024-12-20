import { supabase } from '@/shared/lib/supabase'

export type TodoData = {
  id: string
  task: string
  is_done: boolean
  created_at: string
  user_id: string
}

export const updateTodo = async (
  id: string,
  updates: Partial<Pick<TodoData, 'task' | 'is_done'>>,
) => {
  const { data, error } = await supabase
    .from('todo')
    .update(updates)
    .eq('id', id)

  return {
    data,
    error,
  }
}
