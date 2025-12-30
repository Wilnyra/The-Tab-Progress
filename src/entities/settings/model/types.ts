export type ColorScheme = 'default' | 'blue' | 'green' | 'purple' | 'orange'

export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'

export type TimeFormat = '12h' | '24h'

export type DefaultView = 'dashboard' | 'progress'

export type Settings = {
  colorScheme: ColorScheme
  dateFormat: DateFormat
  timeFormat: TimeFormat
  defaultView: DefaultView
}

export type UpdateSettings = Partial<Settings>
