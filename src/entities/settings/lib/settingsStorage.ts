import { SETTINGS_KEY } from '@/shared/lib/constants'
import { DEFAULT_SETTINGS } from '../model/constants'
import type { Settings } from '../model/types'

export const loadSettings = (): Settings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (!stored) {
      return DEFAULT_SETTINGS
    }

    const parsed = JSON.parse(stored)

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to load settings:', error)
    }
    return DEFAULT_SETTINGS
  }
}

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to save settings:', error)
    }
  }
}
