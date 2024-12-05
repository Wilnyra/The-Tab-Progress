import { Session } from '@supabase/supabase-js'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/shared/lib/supabase'

export const useAuth = () => {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  const getSession = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    setSession(session)
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

  return { session }
}
