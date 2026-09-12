import { z } from 'zod'

export type PasswordFormMode = 'change' | 'recovery'

const MIN_PASSWORD_LENGTH = 6

export const createChangePasswordSchema = (requireCurrent: boolean) =>
  z
    .object({
      currentPassword: requireCurrent
        ? z.string().min(MIN_PASSWORD_LENGTH, {
            message: 'Current password is required',
          })
        : z.string(),
      newPassword: z.string().min(MIN_PASSWORD_LENGTH, {
        message: 'New password must be at least 6 characters',
      }),
      confirmPassword: z.string().min(MIN_PASSWORD_LENGTH, {
        message: 'Password confirmation is required',
      }),
    })
    .refine(
      (data) => !requireCurrent || data.newPassword !== data.currentPassword,
      {
        message: 'New password must be different from current password',
        path: ['newPassword'],
      },
    )
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })

export type ChangePasswordSchema = z.infer<
  ReturnType<typeof createChangePasswordSchema>
>
