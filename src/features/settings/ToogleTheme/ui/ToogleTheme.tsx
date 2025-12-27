import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { THEME_KEY } from '@/shared/lib/constants'
import { Toggle } from '@/shared/ui/Toggle'

export const ToogleTheme = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY)
    const dark = saved === 'dark'
    setIsDark(dark)

    if (dark) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, [])

  const onChange = (pressed: boolean) => {
    setIsDark(pressed)

    if (pressed) {
      document.body.classList.add('dark')
      localStorage.setItem(THEME_KEY, 'dark')
    } else {
      document.body.classList.remove('dark')
      localStorage.setItem(THEME_KEY, 'light')
    }
  }

  return (
    <Toggle
      variant="outline"
      size="sm"
      aria-label="Toggle light theme"
      pressed={isDark}
      defaultPressed={isDark}
      onPressedChange={onChange}
    >
      {isDark ? <Sun /> : <Moon />}
    </Toggle>
  )
}
