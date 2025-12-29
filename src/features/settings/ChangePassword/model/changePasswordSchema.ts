import { z } from 'zod'

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, {
      message: 'Current password is required',
    }),
    newPassword: z.string().min(6, {
      message: 'New password must be at least 6 characters',
    }),
    confirmPassword: z.string().min(6, {
      message: 'Password confirmation is required',
    }),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>
