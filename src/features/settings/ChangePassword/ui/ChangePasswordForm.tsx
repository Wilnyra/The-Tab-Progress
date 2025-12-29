import { zodResolver } from '@hookform/resolvers/zod'
import { Key } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { ChangePasswordSchema } from '../model/changePasswordSchema'
import { changePasswordSchema } from '../model/changePasswordSchema'
import { supabase } from '@/shared/lib/supabase'
import { Button } from '@/shared/ui/Button'
import { Form, FormInput, FormMessage } from '@/shared/ui/Form'

interface ChangePasswordFormProps {
  onSuccess?: () => void
}

export const ChangePasswordForm = ({
  onSuccess,
}: ChangePasswordFormProps): JSX.Element => {
  const formContext = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })
  const [isLoading, setIsLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const getUserEmail = async (): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    getUserEmail()
  }, [])

  const handlePasswordChange = async (
    data: ChangePasswordSchema,
  ): Promise<void> => {
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.email) {
        throw new Error('User email not found')
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword,
      })

      if (signInError) {
        formContext.setError('currentPassword', {
          message: 'Current password is incorrect',
        })
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (updateError) {
        throw updateError
      }

      formContext.reset()
      formContext.setError('root.success', {
        message: 'Password changed successfully!',
      })

      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 1500)
      }
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
          <FormInput
            name="currentPassword"
            label="Current Password"
            type="password"
            autoComplete="current-password"
            disabled={isLoading}
          />
          <FormInput
            name="newPassword"
            label="New Password"
            type="password"
            autoComplete="new-password"
            disabled={isLoading}
          />
          <FormInput
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            disabled={isLoading}
          />

          {formContext.formState.errors.root?.serverError?.message ? (
            <FormMessage className="text-destructive text-sm">
              {formContext.formState.errors.root.serverError.message}
            </FormMessage>
          ) : null}

          {formContext.formState.errors.root?.success?.message ? (
            <FormMessage className="text-green-600 text-sm">
              {formContext.formState.errors.root.success.message}
            </FormMessage>
          ) : null}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <Key className="mr-2 h-4 w-4" />
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
