import type { Theme } from './types'
import { THEME_KEY } from '@/shared/lib/constants'

export const getSystemTheme = (): 'light' | 'dark' => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export const getResolvedTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

export const applyTheme = (theme: Theme): void => {
  const resolvedTheme = getResolvedTheme(theme)
  const root = document.documentElement

  root.classList.remove('light', 'dark')
  root.classList.add(resolvedTheme)
}

export const saveTheme = (theme: Theme): void => {
  localStorage.setItem(THEME_KEY, theme)
}

export const loadTheme = (): Theme => {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}
