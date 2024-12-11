import { z } from 'zod'

export const addProgressFormSchema = z.object({
  value: z.string().min(1, {
    message: 'Value must be at least 1.',
  }),
})

export type AddProgressFormSchema = z.infer<typeof addProgressFormSchema>
