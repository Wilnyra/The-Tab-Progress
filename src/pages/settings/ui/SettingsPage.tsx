import { SettingsContent } from '@/widgets/SettingsContent'

export const SettingsPage = (): JSX.Element => {
  return (
    <div className="px-4 pt-2 sm:px-0 sm:pt-0">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Customize your application preferences
        </p>
      </div>
      <SettingsContent />
    </div>
  )
}
