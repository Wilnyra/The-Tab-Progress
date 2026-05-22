import { supabase } from "@/shared/lib/supabase"

export const insertProgress = async (
  durationSeconds: number,
  userId: string,
  comment?: string | null,
) => {
  const trimmed = comment?.trim()
  const { data, error } = await supabase
    .from('progress')
    .insert({
      duration_seconds: durationSeconds,
      value: Math.floor(durationSeconds / 60),
      user_id: userId,
      comment: trimmed ? trimmed : null,
    })

  return {
    data,
    error,
  }
}
