import { LoginForm, SignUpForm } from '@/features/auth'
import { useState } from 'react';

export const LoginPage = () => {
  const [page, setPage] = useState<'login' | 'signUp'>("login");
  
  return (
    <div className="flex justify-center items-center h-screen">
      {page === 'login' ? <LoginForm onCLickSignUp={() => setPage('signUp')} /> : null}
      {page === 'signUp' ? <SignUpForm /> : null}
    </div>
  )
}
