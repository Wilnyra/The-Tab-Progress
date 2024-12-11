import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LoginFormSchema, loginFormSchema } from '../../model/loginFormSchema'
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
import { Form, FormInput, FormMessage } from '@/shared/ui/Form'

type LoginFormData = {
  email: string
  password: string
}

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()

  const formContext = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async ({ email, password }: LoginFormData) => {
    const from = location.state?.from?.pathname || getRootPath()

    await supabase.auth
      .signInWithPassword({ email, password })
      .then(({ error }) => {
        if (error) {
          formContext.setError('root.serverError', { message: error.message })
        } else {
          navigate(from, { replace: true })
        }
      })
      .catch((error) => {
        formContext.setError('root.serverError', { message: error.message })
      })
  }

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
          <form onSubmit={formContext.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormInput name="email" label="Email" />
              <FormInput
                name="password"
                label={
                  <div className="flex">
                    Password
                    <Link
                      to="#"
                      className="ml-auto inline-block text-sm underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                }
                type="password"
              />

              <FormMessage className="text-destructive text-sm">
                {formContext.formState.errors.root?.serverError?.message}
              </FormMessage>

              <Button type="submit" className="w-full">
                Login
              </Button>
              <Button variant="outline" className="w-full">
                Login with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link to="#" className="underline">
                Sign up
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
