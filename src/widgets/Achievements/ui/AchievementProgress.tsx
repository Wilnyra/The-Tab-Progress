import { cn } from '@/shared/lib/cn'

export type AchievementProgressTone = 'primary' | 'gold' | 'locked' | 'muted'

type AchievementProgressProps = {
  value: number
  max: number
  label: string
  tone?: AchievementProgressTone
  className?: string
}

const FILL_CLASSES: Record<AchievementProgressTone, string> = {
  primary:
    '[&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary',
  gold:
    '[&::-webkit-progress-value]:bg-gradient-to-r ' +
    '[&::-webkit-progress-value]:from-gold-light ' +
    '[&::-webkit-progress-value]:to-gold-dark ' +
    '[&::-moz-progress-bar]:bg-gradient-to-r ' +
    '[&::-moz-progress-bar]:from-gold-light ' +
    '[&::-moz-progress-bar]:to-gold-dark',
  locked:
    '[&::-webkit-progress-value]:bg-foreground/40 ' +
    '[&::-moz-progress-bar]:bg-foreground/40',
  muted:
    '[&::-webkit-progress-value]:bg-foreground/30 ' +
    '[&::-moz-progress-bar]:bg-foreground/30',
}

export const AchievementProgress = ({
  value,
  max,
  label,
  tone = 'primary',
  className,
}: AchievementProgressProps): JSX.Element => (
  <progress
    value={Math.min(value, max)}
    max={max}
    aria-label={label}
    className={cn(
      'block h-1.5 w-full appearance-none overflow-hidden rounded-full',
      'bg-foreground/10 [&::-webkit-progress-bar]:bg-foreground/10',
      '[&::-webkit-progress-value]:rounded-full',
      '[&::-moz-progress-bar]:rounded-full',
      FILL_CLASSES[tone],
      className,
    )}
  />
)
