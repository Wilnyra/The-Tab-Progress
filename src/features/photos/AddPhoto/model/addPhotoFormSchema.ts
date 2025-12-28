import { z } from 'zod'
import {
  getAllowedDomains,
  getAllowedHostsDisplay,
} from '@/shared/lib/allowedImageHosts'

export const addPhotoFormSchema = z.object({
  url: z
    .string()
    .min(1, { message: 'URL cannot be empty' })
    .url({ message: 'Must be a valid URL' })
    .refine(
      (url) => {
        try {
          const parsed = new URL(url)
          return parsed.protocol === 'https:'
        } catch {
          return false
        }
      },
      { message: 'Only HTTPS URLs are allowed for security' },
    )
    .refine(
      (url) => {
        try {
          const parsed = new URL(url)
          const allowedDomains = getAllowedDomains()
          return allowedDomains.some(
            (domain) =>
              parsed.hostname === domain ||
              parsed.hostname.endsWith(`.${domain}`),
          )
        } catch {
          return false
        }
      },
      {
        message: `Only images from trusted hosts are allowed: ${getAllowedHostsDisplay()}`,
      },
    ),
})

export type AddPhotoFormSchema = z.infer<typeof addPhotoFormSchema>
