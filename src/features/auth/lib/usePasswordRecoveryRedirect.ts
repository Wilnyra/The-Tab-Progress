import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { markPasswordRecoveryPending } from './passwordRecovery'
import { getSettingsPath } from '@/shared/lib/routePaths'
import { supabase } from '@/shared/lib/supabase'

export const usePasswordRecoveryRedirect = (): void => {
  const navigate = useNavigate()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event !== 'PASSWORD_RECOVERY') return
      markPasswordRecoveryPending()
      navigate(`${getSettingsPath()}?section=account`, { replace: true })
    })

    return () => subscription.unsubscribe()
  }, [navigate])
}
