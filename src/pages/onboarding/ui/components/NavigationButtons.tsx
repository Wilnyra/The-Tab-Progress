import type { FC } from 'react'
import type { StepProps } from '../../lib/types'
import { Button } from '@/shared/ui/Button'

type NavigationButtonsProps = Pick<
  StepProps,
  'onNext' | 'onBack' | 'onSkip' | 'canGoBack' | 'isLastStep'
>

export const NavigationButtons: FC<NavigationButtonsProps> = ({
  onNext,
  onBack,
  onSkip,
  canGoBack,
  isLastStep,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 mt-8">
      <Button
        variant="ghost"
        onClick={onBack}
        disabled={!canGoBack}
        className={canGoBack ? '' : 'invisible'}
      >
        Back
      </Button>

      <Button variant="outline" onClick={onSkip}>
        Skip
      </Button>

      <Button onClick={onNext}>
        {isLastStep ? 'Go to Dashboard' : 'Next'}
      </Button>
    </div>
  )
}
