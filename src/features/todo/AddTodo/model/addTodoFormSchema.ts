import { z } from 'zod'

export const addTodoFormSchema = z.object({
  todo: z.string().min(4, {
    message: 'Task must be at least 4.',
  }),
})

export type AddTodoFormSchema = z.infer<typeof addTodoFormSchema>
