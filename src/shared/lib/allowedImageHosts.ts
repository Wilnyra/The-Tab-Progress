export type ImageHost = {
  domain: string
  displayName: string
  supportsCORS: boolean
  description?: string
}

export const ALLOWED_IMAGE_HOSTS: readonly ImageHost[] = [
  {
    domain: 'imgur.com',
    displayName: 'Imgur',
    supportsCORS: true,
    description: 'Popular image hosting service',
  },
  {
    domain: 'i.imgur.com',
    displayName: 'Imgur CDN',
    supportsCORS: true,
  },
  {
    domain: 'unsplash.com',
    displayName: 'Unsplash',
    supportsCORS: true,
    description: 'Free stock photos',
  },
  {
    domain: 'images.unsplash.com',
    displayName: 'Unsplash CDN',
    supportsCORS: true,
  },
  {
    domain: 'cloudinary.com',
    displayName: 'Cloudinary',
    supportsCORS: true,
    description: 'Media management platform',
  },
  {
    domain: 'res.cloudinary.com',
    displayName: 'Cloudinary CDN',
    supportsCORS: true,
  },
  {
    domain: 'picsum.photos',
    displayName: 'Lorem Picsum',
    supportsCORS: true,
    description: 'Placeholder images',
  },
  {
    domain: 'via.placeholder.com',
    displayName: 'Placeholder.com',
    supportsCORS: true,
    description: 'Simple placeholder service',
  },
  {
    domain: 'pinimg.com',
    displayName: 'Pinterest',
    supportsCORS: false,
    description: 'Pinterest images',
  },
  {
    domain: 'i.pinimg.com',
    displayName: 'Pinterest CDN',
    supportsCORS: false,
  },
] as const

export const getAllowedDomains = (): readonly string[] => {
  return ALLOWED_IMAGE_HOSTS.map((host) => host.domain)
}

export const getAllowedHostsDisplay = (): string => {
  return ALLOWED_IMAGE_HOSTS.map((host) => host.displayName).join(', ')
}

export const isAllowedImageHost = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    const allowedDomains = getAllowedDomains()

    return allowedDomains.some(
      (domain) =>
        parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`),
    )
  } catch {
    return false
  }
}

export const hostSupportsCORS = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    const host = ALLOWED_IMAGE_HOSTS.find(
      (h) =>
        parsed.hostname === h.domain ||
        parsed.hostname.endsWith(`.${h.domain}`),
    )
    return host?.supportsCORS ?? false
  } catch {
    return false
  }
}

export const validateImageUrl = (
  url: string,
): {
  isValid: boolean
  error?: string
} => {
  try {
    const parsed = new URL(url)

    if (parsed.protocol !== 'https:') {
      return {
        isValid: false,
        error: 'Only HTTPS URLs are allowed for security',
      }
    }

    if (!isAllowedImageHost(url)) {
      return {
        isValid: false,
        error: `Only images from trusted hosts are allowed: ${getAllowedHostsDisplay()}`,
      }
    }

    return { isValid: true }
  } catch {
    return {
      isValid: false,
      error: 'Must be a valid URL',
    }
  }
}
