import {
  classifyInsertError,
  type InsertErrorInfo,
  type InsertOutcome,
} from '../lib/classifyInsertError'
import { supabase } from '@/shared/lib/supabase'

const SECONDS_PER_MINUTE = 60

export type InsertProgressRow = {
  clientId: string
  userId: string
  createdAt: string
  durationSeconds: number
  comment: string | null
}

export type InsertProgressResult = {
  kind: InsertOutcome
  error: InsertErrorInfo | null
}

type PostgrestLikeResponse = {
  status: number
  error: { code?: string; message?: string; details?: string } | null
}

const ABORTED: InsertProgressResult = {
  kind: 'retry',
  error: { status: 0, code: '', message: 'Aborted' },
}

const toResult = ({
  status,
  error,
}: PostgrestLikeResponse): InsertProgressResult => {
  if (!error) return { kind: 'ok', error: null }
  const info: InsertErrorInfo = {
    status,
    code: error.code ?? '',
    message: error.message ?? '',
  }
  return {
    kind: classifyInsertError({ ...info, details: error.details ?? '' }),
    error: info,
  }
}

export const insertProgress = (
  row: InsertProgressRow,
  signal?: AbortSignal,
): Promise<InsertProgressResult> => {
  if (signal?.aborted) return Promise.resolve(ABORTED)
  const trimmed = row.comment?.trim()
  const query = supabase.from('progress').insert({
    client_id: row.clientId,
    user_id: row.userId,
    created_at: row.createdAt,
    duration_seconds: row.durationSeconds,
    value: Math.floor(row.durationSeconds / SECONDS_PER_MINUTE),
    comment: trimmed ? trimmed : null,
  })
  if (!signal) return Promise.resolve(query).then(toResult)

  return new Promise<InsertProgressResult>((resolve) => {
    const handleAbort = (): void => resolve(ABORTED)
    signal.addEventListener('abort', handleAbort, { once: true })
    query.abortSignal(signal).then(
      (response) => {
        signal.removeEventListener('abort', handleAbort)
        resolve(toResult(response))
      },
      (error: unknown) => {
        signal.removeEventListener('abort', handleAbort)
        resolve({
          kind: 'retry',
          error: { status: 0, code: '', message: String(error) },
        })
      },
    )
  })
}
