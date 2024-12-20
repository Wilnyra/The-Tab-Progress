import { supabase } from '@/shared/lib/supabase'
import { TodoData } from './updateTodo'

export const insertTodo = async (todo: TodoData['task'], userId: string) => {
  const { data, error } = await supabase
    .from('todo')
    .insert({ task: todo, user_id: userId })

  return {
    data,
    error,
  }
}
