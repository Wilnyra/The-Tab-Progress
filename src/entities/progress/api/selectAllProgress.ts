import { ProgressData } from "../model/types"
import { supabase } from "@/shared/lib/supabase"

export const selectAllProgress = async () => {
  const { data, error } = await supabase
    .from('progress')
    .select('*')

  return {
    data: data as ProgressData[],
    error,
  }
}
