import type {
  Settings,
  ColorScheme,
  DateFormat,
  TimeFormat,
  DefaultView,
} from './types'

export const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  colorScheme: 'default',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12-hour',
  defaultView: '/',
}

export const COLOR_SCHEMES: Record<
  ColorScheme,
  { primary: string; accent: string }
> = {
  default: {
    primary: '240 5.9% 10%',
    accent: '240 4.8% 95.9%',
  },
  blue: {
    primary: '221 83% 53%',
    accent: '221 83% 93%',
  },
  green: {
    primary: '142 71% 45%',
    accent: '142 71% 93%',
  },
  purple: {
    primary: '262 83% 58%',
    accent: '262 83% 93%',
  },
  orange: {
    primary: '25 95% 53%',
    accent: '25 95% 93%',
  },
}

export const DATE_FORMAT_OPTIONS: Array<{
  value: DateFormat
  label: string
}> = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
]

export const TIME_FORMAT_OPTIONS: Array<{
  value: TimeFormat
  label: string
}> = [
  { value: '12-hour', label: '12-hour' },
  { value: '24-hour', label: '24-hour' },
]

export const DEFAULT_VIEW_OPTIONS: Array<{
  value: DefaultView
  label: string
}> = [
  { value: '/', label: 'Dashboard' },
  { value: '/progress', label: 'Progress' },
]
