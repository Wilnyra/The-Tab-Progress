import type { PostgrestError } from '@supabase/supabase-js'
import type { TodoData } from '../model/types'
import { supabase } from '@/shared/lib/supabase'

const isTodoData = (value: unknown): value is TodoData =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  'task' in value &&
  typeof value.task === 'string'

export const insertTodo = async (
  task: TodoData['task'],
  userId: string,
): Promise<{ data: TodoData | null; error: PostgrestError | null }> => {
  const { data, error } = await supabase
    .from('todo')
    .insert({ task, user_id: userId })
    .select()
    .single()

  return {
    data: isTodoData(data) ? data : null,
    error,
  }
}
