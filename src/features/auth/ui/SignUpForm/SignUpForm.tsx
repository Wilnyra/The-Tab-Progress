import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
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

export const SignUpForm = () => {
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
      .signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://the-tab-progress.vercel.app',
        },
      })
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
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your email below to sign up for a new account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...formContext}>
          <form onSubmit={formContext.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormInput name="email" label="Email" />
              <FormInput
                name="password"
                label={<div className="flex">Password</div>}
                type="password"
              />
              <FormMessage className="text-destructive text-sm">
                {formContext.formState.errors.root?.serverError?.message}
              </FormMessage>
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
