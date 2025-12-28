import { z } from 'zod'

export const addPathFormSchema = z.object({
  step: z
    .string()
    .min(3, {
      message: 'Achievement must be at least 3 characters.',
    })
    .max(200, {
      message: 'Achievement must be less than 200 characters.',
    }),
})

export type AddPathFormSchema = z.infer<typeof addPathFormSchema>
