import { ToogleTheme } from '@/features/settings/ToogleTheme'

export const AppearanceTab = (): JSX.Element => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Theme</h3>
        <ToogleTheme />
      </div>
    </div>
  )
}
