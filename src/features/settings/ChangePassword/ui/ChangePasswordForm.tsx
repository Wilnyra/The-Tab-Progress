import { zodResolver } from '@hookform/resolvers/zod'
import { Key } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  createChangePasswordSchema,
  type ChangePasswordSchema,
  type PasswordFormMode,
} from '../model/changePasswordSchema'
import { supabase } from '@/shared/lib/supabase'
import { Button } from '@/shared/ui/Button'
import { Form, FormMessage, FormPasswordInput } from '@/shared/ui/Form'

type ChangePasswordFormProps = {
  mode?: PasswordFormMode
  onSuccess?: () => void
}

export const ChangePasswordForm = ({
  mode = 'change',
  onSuccess,
}: ChangePasswordFormProps): JSX.Element => {
  const isRecovery = mode === 'recovery'
  const schema = useMemo(
    () => createChangePasswordSchema(!isRecovery),
    [isRecovery],
  )
  const formContext = useForm<ChangePasswordSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })
  const [isLoading, setIsLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    let cancelled = false
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!cancelled && user?.email) setUserEmail(user.email)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handlePasswordChange = async (
    data: ChangePasswordSchema,
  ): Promise<void> => {
    if (isLoading) return
    setIsLoading(true)

    try {
      if (!isRecovery) {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user?.email) {
          throw new Error('User email not found')
        }

        const { error: signInError } = await supabase.auth.signInWithPassword(
          {
            email: user.email,
            password: data.currentPassword,
          },
        )

        if (signInError) {
          formContext.setError('currentPassword', {
            message: 'Current password is incorrect',
          })
          return
        }
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (updateError) {
        throw updateError
      }

      formContext.reset()
      onSuccess?.()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to change password'
      formContext.setError('root.serverError', { message: errorMessage })

      if (import.meta.env.DEV) {
        console.error('Password change failed:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...formContext}>
      <form onSubmit={formContext.handleSubmit(handlePasswordChange)}>
        <input
          type="email"
          autoComplete="username"
          value={userEmail}
          readOnly
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
        <div className="grid gap-4">
          {isRecovery ? null : (
            <FormPasswordInput
              name="currentPassword"
              label="Current password"
              autoComplete="current-password"
              disabled={isLoading}
            />
          )}
          <FormPasswordInput
            name="newPassword"
            label="New password"
            autoComplete="new-password"
            disabled={isLoading}
          />
          <FormPasswordInput
            name="confirmPassword"
            label="Confirm new password"
            autoComplete="new-password"
            disabled={isLoading}
          />

          {formContext.formState.errors.root?.serverError?.message ? (
            <FormMessage className="text-destructive text-sm">
              {formContext.formState.errors.root.serverError.message}
            </FormMessage>
          ) : null}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <Key className="mr-2 h-4 w-4" />
            {isLoading ? 'Updating password...' : 'Update password'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
