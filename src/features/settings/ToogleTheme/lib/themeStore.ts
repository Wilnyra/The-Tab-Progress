import { applyTheme, loadTheme, saveTheme, getResolvedTheme } from './applyTheme'
import type { Theme } from './types'

type ThemeState = {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
}

type Listener = () => void

class ThemeStore {
  private state: ThemeState
  private listeners = new Set<Listener>()
  private mediaQuery: MediaQueryList | null = null

  constructor() {
    const initialTheme = loadTheme()
    this.state = {
      theme: initialTheme,
      resolvedTheme: getResolvedTheme(initialTheme),
    }
    applyTheme(initialTheme)
    this.initMediaQueryListener()
  }

  private initMediaQueryListener(): void {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (): void => {
      if (this.state.theme === 'system') {
        const newResolvedTheme = getResolvedTheme('system')
        this.state = {
          ...this.state,
          resolvedTheme: newResolvedTheme,
        }
        applyTheme('system')
        this.notify()
      }
    }

    this.mediaQuery.addEventListener('change', handleChange)
  }

  getState(): ThemeState {
    return this.state
  }

  setTheme(theme: Theme): void {
    this.state = {
      theme,
      resolvedTheme: getResolvedTheme(theme),
    }
    saveTheme(theme)
    applyTheme(theme)
    this.notify()
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener())
  }
}

export const themeStore = new ThemeStore()
