import { useCallback, useRef, useState } from 'react'
import { supabase } from '@/shared/lib/supabase'

const RESEND_COOLDOWN_MS = 60_000

type PasswordResetStatus = 'idle' | 'sending' | 'sent'

type UsePasswordResetResult = {
  status: PasswordResetStatus
  error: string | null
  requestReset: (email: string) => Promise<void>
}

export const usePasswordReset = (): UsePasswordResetResult => {
  const [status, setStatus] = useState<PasswordResetStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const inFlightRef = useRef(false)
  const lastSentRef = useRef<{ email: string; at: number } | null>(null)

  const requestReset = useCallback(async (email: string): Promise<void> => {
    if (inFlightRef.current) return
    const normalized = email.trim().toLowerCase()
    const last = lastSentRef.current
    if (
      last &&
      last.email === normalized &&
      Date.now() - last.at < RESEND_COOLDOWN_MS
    ) {
      setStatus('sent')
      return
    }

    inFlightRef.current = true
    setStatus('sending')
    setError(null)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: window.location.origin },
      )
      if (resetError) {
        setError(resetError.message)
        setStatus('idle')
        return
      }
      lastSentRef.current = { email: normalized, at: Date.now() }
      setStatus('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('idle')
    } finally {
      inFlightRef.current = false
    }
  }, [])

  return { status, error, requestReset }
}
