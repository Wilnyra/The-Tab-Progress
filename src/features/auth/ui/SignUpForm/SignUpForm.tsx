import { zodResolver } from '@hookform/resolvers/zod'
import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  type LoginFormSchema,
  loginFormSchema,
} from '../../model/loginFormSchema'
import { hasCompletedOnboarding } from '@/pages/onboarding/lib/onboardingStorage'
import { getRootPath, getOnboardingPath } from '@/shared/lib/routePaths'
import { supabase } from '@/shared/lib/supabase'
import { Button } from '@/shared/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/Card'
import {
  Form,
  FormInput,
  FormMessage,
  FormPasswordInput,
} from '@/shared/ui/Form'

type SignUpFormProps = {
  onClickLogin: () => void
}

export const SignUpForm = ({ onClickLogin }: SignUpFormProps): JSX.Element => {
  const navigate = useNavigate()
  const submittingRef = useRef(false)

  const formContext = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleSubmit = async ({
    email,
    password,
  }: LoginFormSchema): Promise<void> => {
    if (submittingRef.current) return
    submittingRef.current = true

    const redirectUrl =
      import.meta.env.VITE_REDIRECT_URL || window.location.origin

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl },
      })
      if (error) {
        formContext.setError('root.serverError', { message: error.message })
      } else {
        const destination = hasCompletedOnboarding()
          ? getRootPath()
          : getOnboardingPath()
        navigate(destination, { replace: true })
      }
    } catch (error) {
      formContext.setError('root.serverError', {
        message:
          error instanceof Error ? error.message : 'Something went wrong',
      })
    } finally {
      submittingRef.current = false
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your email below to sign up for a new account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...formContext}>
          <form onSubmit={formContext.handleSubmit(handleSubmit)}>
            <div className="grid gap-4">
              <FormInput
                name="email"
                label="Email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="next"
              />
              <FormPasswordInput
                name="password"
                label="Password"
                autoComplete="new-password"
                enterKeyHint="done"
              />
              <FormMessage className="text-destructive text-sm">
                {formContext.formState.errors.root?.serverError?.message}
              </FormMessage>
              <Button
                type="submit"
                className="w-full"
                disabled={formContext.formState.isSubmitting}
              >
                Sign Up
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <button
                type="button"
                className="underline underline-offset-4"
                onClick={onClickLogin}
              >
                Log in
              </button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
