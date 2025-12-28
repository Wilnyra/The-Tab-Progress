import { DateTimeFormatSelector } from '@/features/settings/DateTimeFormat'
import { DefaultViewSelector } from '@/features/settings/DefaultView'

export const GeneralTab = (): JSX.Element => {
  return (
    <div className="space-y-6">
      <DateTimeFormatSelector />
      <DefaultViewSelector />
    </div>
  )
}
