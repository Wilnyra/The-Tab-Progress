import { zodResolver } from '@hookform/resolvers/zod'
import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { usePasswordReset } from '../../lib/usePasswordReset'
import {
  type LoginFormSchema,
  loginFormSchema,
} from '../../model/loginFormSchema'
import { getRootPath } from '@/shared/lib/routePaths'
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

type LoginFormProps = {
  onClickSignUp: () => void
  onClickMagicLink: () => void
}

export const LoginForm = ({
  onClickSignUp,
  onClickMagicLink,
}: LoginFormProps): JSX.Element => {
  const navigate = useNavigate()
  const location = useLocation()
  const submittingRef = useRef(false)
  const {
    status: resetStatus,
    error: resetError,
    requestReset,
  } = usePasswordReset()

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

    const from = location.state?.from?.pathname || getRootPath()

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        formContext.setError('root.serverError', { message: error.message })
      } else {
        navigate(from, { replace: true })
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

  const handleForgotPassword = async (): Promise<void> => {
    const isEmailValid = await formContext.trigger('email')
    if (!isEmailValid) {
      formContext.setFocus('email')
      return
    }
    await requestReset(formContext.getValues('email'))
  }

  const forgotPasswordButton = (
    <button
      type="button"
      onClick={handleForgotPassword}
      disabled={resetStatus === 'sending'}
      className="-my-3 inline-flex min-h-11 items-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50 sm:my-0 sm:min-h-0"
    >
      {resetStatus === 'sending' ? 'Sending...' : 'Forgot password?'}
    </button>
  )

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
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
                labelAction={forgotPasswordButton}
                autoComplete="current-password"
                enterKeyHint="done"
              />

              {resetStatus === 'sent' ? (
                <p role="status" className="text-sm text-muted-foreground">
                  Check your email for a link to reset your password.
                </p>
              ) : null}
              {resetError ? (
                <p role="alert" className="text-sm text-destructive">
                  {resetError}
                </p>
              ) : null}

              <FormMessage className="text-destructive text-sm">
                {formContext.formState.errors.root?.serverError?.message}
              </FormMessage>

              <Button
                type="submit"
                className="w-full"
                disabled={formContext.formState.isSubmitting}
              >
                Login
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onClickMagicLink}
              >
                Email me a sign-in link
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                className="underline underline-offset-4"
                onClick={onClickSignUp}
              >
                Sign up
              </button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
