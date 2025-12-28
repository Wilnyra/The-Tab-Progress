export type Theme = 'light' | 'dark'

export type ColorScheme = 'default' | 'blue' | 'green' | 'purple' | 'orange'

export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'

export type TimeFormat = '12-hour' | '24-hour'

export type DefaultView = '/' | '/progress'

export interface Settings {
  theme: Theme
  colorScheme: ColorScheme
  dateFormat: DateFormat
  timeFormat: TimeFormat
  defaultView: DefaultView
}
