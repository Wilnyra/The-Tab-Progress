import { supabase } from "@/shared/lib/supabase"

export const insertProgress = async (
  value: number,
  userId: string
) => {
  const { data, error } = await supabase
    .from('progress')
    .insert({ value, user_id: userId })

  return {
    data,
    error,
  }
}
