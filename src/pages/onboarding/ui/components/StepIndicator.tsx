import type { FC } from 'react'
import { cn } from '@/shared/lib/cn'

interface StepIndicatorProps {
  readonly current: number
  readonly total: number
}

export const StepIndicator: FC<StepIndicatorProps> = ({ current, total }) => {
  const steps = Array.from({ length: total }, (_, i) => i)

  return (
    <div
      className="flex items-center justify-center gap-2"
      role="navigation"
      aria-label="Onboarding progress"
    >
      {steps.map((step) => (
        <div
          key={step}
          className={cn(
            'h-2 w-2 rounded-full transition-all duration-300',
            step === current
              ? 'bg-primary w-8'
              : step < current
                ? 'bg-primary/50'
                : 'bg-muted',
          )}
          aria-label={`Step ${step + 1}${step === current ? ' (current)' : step < current ? ' (completed)' : ''}`}
          aria-current={step === current ? 'step' : undefined}
        />
      ))}
    </div>
  )
}
