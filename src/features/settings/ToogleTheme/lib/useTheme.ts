import { useSyncExternalStore, useCallback } from 'react'
import type { Theme } from './types'
import { themeStore } from './themeStore'

interface UseThemeReturn {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

export const useTheme = (): UseThemeReturn => {
  const state = useSyncExternalStore(
    (listener) => themeStore.subscribe(listener),
    () => themeStore.getState(),
    () => themeStore.getState()
  )

  const setTheme = useCallback((newTheme: Theme): void => {
    themeStore.setTheme(newTheme)
  }, [])

  return {
    theme: state.theme,
    resolvedTheme: state.resolvedTheme,
    setTheme,
  }
}
