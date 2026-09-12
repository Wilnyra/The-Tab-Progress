import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  magicLinkFormSchema,
  type MagicLinkFormSchema,
} from '../model/magicLinkFormSchema'
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

type OtpAuthFormProps = {
  onClickPasswordLogin: () => void
}

export const OtpAuthForm = ({
  onClickPasswordLogin,
}: OtpAuthFormProps): JSX.Element => {
  const submittingRef = useRef(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const formContext = useForm<MagicLinkFormSchema>({
    resolver: zodResolver(magicLinkFormSchema),
    defaultValues: { email: '' },
  })
  const { isSubmitting } = formContext.formState

  const handleSubmit = async ({
    email,
  }: MagicLinkFormSchema): Promise<void> => {
    if (submittingRef.current) return
    submittingRef.current = true
    setSentTo(null)

    const redirectUrl =
      import.meta.env.VITE_REDIRECT_URL || window.location.origin

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectUrl },
      })
      if (error) {
        formContext.setError('root.serverError', { message: error.message })
        return
      }
      setSentTo(email)
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
        <CardTitle className="text-2xl">Sign-in link</CardTitle>
        <CardDescription>
          We&apos;ll email you a link that signs you in without a password
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
                enterKeyHint="send"
              />

              <FormMessage className="text-destructive text-sm">
                {formContext.formState.errors.root?.serverError?.message}
              </FormMessage>

              {sentTo ? (
                <p role="status" className="text-sm text-muted-foreground">
                  Check your email. We sent a sign-in link to {sentTo}.
                </p>
              ) : null}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Email me a link'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                className="underline underline-offset-4"
                onClick={onClickPasswordLogin}
              >
                Log in with password
              </button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
