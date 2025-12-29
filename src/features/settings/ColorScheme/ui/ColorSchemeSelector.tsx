import { Check } from 'lucide-react'
import { useSettings, COLOR_SCHEMES } from '@/entities/settings'
import type { ColorScheme } from '@/entities/settings'
import { cn } from '@/shared/lib/cn'
import { Label } from '@/shared/ui/Label'

const SCHEMES: Array<{ value: ColorScheme; label: string }> = [
  { value: 'default', label: 'Default' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'purple', label: 'Purple' },
  { value: 'orange', label: 'Orange' },
]

export const ColorSchemeSelector = (): JSX.Element => {
  const { settings, updateSettings } = useSettings()

  const handleSchemeChange = (scheme: ColorScheme): void => {
    updateSettings({ colorScheme: scheme })
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="color-scheme">Color Scheme</Label>
      <div className="flex gap-2">
        {SCHEMES.map((scheme) => {
          const isActive = settings.colorScheme === scheme.value
          const colors = COLOR_SCHEMES[scheme.value]

          return (
            <button
              key={scheme.value}
              type="button"
              onClick={() => handleSchemeChange(scheme.value)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-md border-2 transition-colors relative',
                isActive
                  ? 'border-primary bg-accent'
                  : 'border-transparent hover:border-muted-foreground/20'
              )}
              aria-label={`Select ${scheme.label} color scheme`}
              aria-current={isActive ? 'true' : undefined}
            >
              {isActive && (
                <Check className="absolute top-1 right-1 w-3 h-3" aria-hidden="true" />
              )}
              <div
                className="w-8 h-8 rounded-full border-2 border-background"
                style={{ backgroundColor: `hsl(${colors.primary})` }}
              />
              <span className="text-xs">{scheme.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
