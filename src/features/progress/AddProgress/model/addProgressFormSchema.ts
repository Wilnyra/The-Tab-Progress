import { z } from 'zod'

export const MAX_PROGRESS_MINUTES = 12 * 60
export const MAX_COMMENT_LENGTH = 200

export const addProgressFormSchema = z
  .object({
    hours: z.coerce
      .number({ invalid_type_error: 'Hours must be a number' })
      .int('Hours must be a whole number')
      .min(0, 'Hours must be 0 or more')
      .max(12, 'Hours must be 12 or less'),
    minutes: z.coerce
      .number({ invalid_type_error: 'Minutes must be a number' })
      .int('Minutes must be a whole number')
      .min(0, 'Minutes must be 0 or more')
      .max(59, 'Minutes must be 59 or less'),
    comment: z
      .string()
      .max(MAX_COMMENT_LENGTH, `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer`)
      .optional()
      .default(''),
  })
  .refine(
    ({ hours, minutes }) => {
      const total = hours * 60 + minutes
      return total >= 1 && total <= MAX_PROGRESS_MINUTES
    },
    {
      message: 'Duration must be between 1 minute and 12 hours',
      path: ['minutes'],
    },
  )

export type AddProgressFormSchema = z.infer<typeof addProgressFormSchema>
