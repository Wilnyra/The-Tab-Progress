import { TodoData } from './updateTodo'
import { supabase } from '@/shared/lib/supabase'

export const insertTodo = async (todo: TodoData['task'], userId: string) => {
  const { data, error } = await supabase
    .from('todo')
    .insert({ task: todo, user_id: userId })

  return {
    data,
    error,
  }
}
