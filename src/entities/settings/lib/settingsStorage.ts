import { DEFAULT_SETTINGS } from '../model/constants'
import type { Settings, UpdateSettings } from '../model/types'

const SETTINGS_KEY = 'APP_SETTINGS'

export const loadSettings = (): Settings => {
  const stored = localStorage.getItem(SETTINGS_KEY)
  if (!stored) {
    return DEFAULT_SETTINGS
  }

  try {
    const parsed = JSON.parse(stored)
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export const saveSettings = (settings: Settings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export const updateStoredSettings = (updates: UpdateSettings): Settings => {
  const current = loadSettings()
  const updated = { ...current, ...updates }
  saveSettings(updated)
  return updated
}
