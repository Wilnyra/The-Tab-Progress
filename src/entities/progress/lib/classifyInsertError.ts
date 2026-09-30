export type InsertErrorInfo = {
  status: number
  code: string
  message: string
}

export type InsertErrorInput = InsertErrorInfo & {
  details?: string
}

export type InsertOutcome = 'ok' | 'retry' | 'auth' | 'permanent'

const UNIQUE_VIOLATION = '23505'
const CLIENT_ID_CONSTRAINT = 'progress_user_client_id_key'
const AUTH_STATUSES: ReadonlySet<number> = new Set([401, 403])
const AUTH_CODES: ReadonlySet<string> = new Set([
  '42501',
  'PGRST301',
  'PGRST303',
])
const RETRY_STATUSES: ReadonlySet<number> = new Set([408, 429])
const RETRY_CODES: ReadonlySet<string> = new Set(['PGRST000', 'PGRST002'])
const SERVER_ERROR_MIN_STATUS = 500

const isClientIdConflict = ({
  message,
  details = '',
}: InsertErrorInput): boolean =>
  message.includes(CLIENT_ID_CONSTRAINT) ||
  details.includes(CLIENT_ID_CONSTRAINT)

export const classifyInsertError = (error: InsertErrorInput): InsertOutcome => {
  const { status, code } = error
  if (status === 0) return 'retry'
  if (code === UNIQUE_VIOLATION) {
    return isClientIdConflict(error) ? 'ok' : 'permanent'
  }
  if (AUTH_CODES.has(code) || AUTH_STATUSES.has(status)) return 'auth'
  if (
    RETRY_STATUSES.has(status) ||
    status >= SERVER_ERROR_MIN_STATUS ||
    RETRY_CODES.has(code)
  ) {
    return 'retry'
  }
  return 'permanent'
}
