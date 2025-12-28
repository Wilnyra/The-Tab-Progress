import { z } from 'zod'

export const editPathFormSchema = z.object({
  step: z
    .string()
    .min(3, {
      message: 'Achievement must be at least 3 characters.',
    })
    .max(200, {
      message: 'Achievement must be less than 200 characters.',
    }),
})

export type EditPathFormSchema = z.infer<typeof editPathFormSchema>
