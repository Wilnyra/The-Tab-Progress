import { z } from 'zod'

export const addProgressCommentFormSchema = z.object({
  value: z.string().min(1, {
    message: 'Value must be at least 1.',
  }),
})

export type AddProgressCommentFormSchema = z.infer<
  typeof addProgressCommentFormSchema
>
