import { useSearchParams } from 'react-router-dom'
import { AccountTab } from './AccountTab'
import { AppearanceTab } from './AppearanceTab'
import { SettingsSidebar } from './SettingsSidebar'

export const SettingsContent = (): JSX.Element => {
  const [searchParams] = useSearchParams()
  const activeSection = searchParams.get('section') ?? 'appearance'

  const renderContent = (): JSX.Element => {
    if (activeSection === 'account') {
      return <AccountTab />
    }
    return <AppearanceTab />
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
      <SettingsSidebar activeSection={activeSection} />
      <div className="flex-1 min-w-0">
        <div className="space-y-6">{renderContent()}</div>
      </div>
    </div>
  )
}
