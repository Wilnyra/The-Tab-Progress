import { useSettings, DEFAULT_VIEW_OPTIONS } from '@/entities/settings'
import type { DefaultView } from '@/entities/settings'
import { Label } from '@/shared/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select'

export const DefaultViewSelector = (): JSX.Element => {
  const { settings, updateSettings } = useSettings()

  const handleDefaultViewChange = (value: string): void => {
    updateSettings({ defaultView: value as DefaultView })
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="default-view">Default View on Launch</Label>
      <Select
        value={settings.defaultView}
        onValueChange={handleDefaultViewChange}
      >
        <SelectTrigger id="default-view">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DEFAULT_VIEW_OPTIONS.map(
            (option: { value: DefaultView; label: string }) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
