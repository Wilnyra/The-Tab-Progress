import { Session } from '@supabase/supabase-js'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/shared/lib/supabase'

export const useAuth = () => {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  const getSession = useCallback(async (): Promise<void> => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    setSession(session)
  }, [])

  const signOut = useCallback(async (): Promise<void> => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to sign out:', error)
      }
      throw error
    }
  }, [])

  useEffect(() => {
    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [getSession])

  return { session, signOut }
}
