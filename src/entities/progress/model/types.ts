export type ProgressEvent = {
  id: string
  duration_seconds: number
  created_at: string
  user_id: string
  comment?: string | null
}

export type ProgressData = ProgressEvent & { value: number }
