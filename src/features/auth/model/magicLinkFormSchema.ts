import type { z } from 'zod'
import { loginFormSchema } from './loginFormSchema'

export const magicLinkFormSchema = loginFormSchema.pick({ email: true })

export type MagicLinkFormSchema = z.infer<typeof magicLinkFormSchema>
