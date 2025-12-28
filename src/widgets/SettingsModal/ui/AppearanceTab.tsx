import { ToogleTheme } from '@/features/settings/ToogleTheme'
import { ColorSchemeSelector } from '@/features/settings/ColorScheme'

export const AppearanceTab = (): JSX.Element => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Theme</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Dark Mode</span>
          <ToogleTheme />
        </div>
      </div>

      <ColorSchemeSelector />
    </div>
  )
}
