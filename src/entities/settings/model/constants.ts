import type { DateFormat, TimeFormat, DefaultView } from './types'

export const DATE_FORMAT_OPTIONS: Array<{ value: DateFormat; label: string }> = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
]

export const TIME_FORMAT_OPTIONS: Array<{ value: TimeFormat; label: string }> = [
  { value: '12h', label: '12-hour' },
  { value: '24h', label: '24-hour' },
]

export const DEFAULT_VIEW_OPTIONS: Array<{ value: DefaultView; label: string }> = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'progress', label: 'Progress' },
]

export const DEFAULT_SETTINGS = {
  colorScheme: 'default' as const,
  dateFormat: 'MM/DD/YYYY' as const,
  timeFormat: '12h' as const,
  defaultView: 'dashboard' as const,
}
