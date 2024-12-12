import { z } from 'zod'

export const addPhotoFormSchema = z.object({
  url: z.string().min(1, {
    message: 'Url must be at least 1.',
  }),
})

export type AddPhotoFormSchema = z.infer<typeof addPhotoFormSchema>
