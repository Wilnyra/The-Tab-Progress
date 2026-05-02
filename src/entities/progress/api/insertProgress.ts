import { supabase } from "@/shared/lib/supabase"

export const insertProgress = async (
  durationSeconds: number,
  userId: string
) => {
  const { data, error } = await supabase
    .from('progress')
    .insert({
      duration_seconds: durationSeconds,
      value: Math.floor(durationSeconds / 60),
      user_id: userId,
    })

  return {
    data,
    error,
  }
}
