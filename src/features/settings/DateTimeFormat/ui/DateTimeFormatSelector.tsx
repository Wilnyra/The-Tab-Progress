import {
  useSettings,
  DATE_FORMAT_OPTIONS,
  TIME_FORMAT_OPTIONS,
} from '@/entities/settings'
import type { DateFormat, TimeFormat } from '@/entities/settings'
import { Label } from '@/shared/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select'

export const DateTimeFormatSelector = (): JSX.Element => {
  const { settings, updateSettings } = useSettings()

  const handleDateFormatChange = (value: string): void => {
    updateSettings({ dateFormat: value as DateFormat })
  }

  const handleTimeFormatChange = (value: string): void => {
    updateSettings({ timeFormat: value as TimeFormat })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date-format">Date Format</Label>
        <Select value={settings.dateFormat} onValueChange={handleDateFormatChange}>
          <SelectTrigger id="date-format">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_FORMAT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="time-format">Time Format</Label>
        <Select value={settings.timeFormat} onValueChange={handleTimeFormatChange}>
          <SelectTrigger id="time-format">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_FORMAT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
