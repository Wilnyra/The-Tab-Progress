import { useCallback, useState } from 'react'
import type { Settings, UpdateSettings } from '../model/types'
import { loadSettings, updateStoredSettings } from './settingsStorage'

type UseSettingsReturn = {
  settings: Settings
  updateSettings: (updates: UpdateSettings) => void
}

export const useSettings = (): UseSettingsReturn => {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  const updateSettings = useCallback((updates: UpdateSettings): void => {
    const updated = updateStoredSettings(updates)
    setSettings(updated)
  }, [])

  return {
    settings,
    updateSettings,
  }
}
