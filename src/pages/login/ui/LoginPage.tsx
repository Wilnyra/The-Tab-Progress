import { useCallback, useState } from 'react'
import { LoginForm, OtpAuthForm, SignUpForm } from '@/features/auth'

type AuthView = 'login' | 'signUp' | 'magicLink'

export const LoginPage = (): JSX.Element => {
  const [view, setView] = useState<AuthView>('login')

  const handleShowLogin = useCallback((): void => setView('login'), [])
  const handleShowSignUp = useCallback((): void => setView('signUp'), [])
  const handleShowMagicLink = useCallback(
    (): void => setView('magicLink'),
    [],
  )

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      {view === 'login' ? (
        <LoginForm
          onClickSignUp={handleShowSignUp}
          onClickMagicLink={handleShowMagicLink}
        />
      ) : null}
      {view === 'signUp' ? <SignUpForm onClickLogin={handleShowLogin} /> : null}
      {view === 'magicLink' ? (
        <OtpAuthForm onClickPasswordLogin={handleShowLogin} />
      ) : null}
    </div>
  )
}
