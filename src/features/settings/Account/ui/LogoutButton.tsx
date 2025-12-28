import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/entities/session'
import { getLoginPath } from '@/shared/lib/routePaths'
import { Button } from '@/shared/ui/Button'

export const LogoutButton = (): JSX.Element => {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await signOut()
      navigate(getLoginPath(), { replace: true })
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Logout failed:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="destructive"
      onClick={handleLogout}
      disabled={isLoading}
      className="w-full sm:w-auto"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isLoading ? 'Logging out...' : 'Log Out'}
    </Button>
  )
}
