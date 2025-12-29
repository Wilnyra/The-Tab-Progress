import type { FC } from 'react'
import { Card, CardHeader, CardContent } from '@/shared/ui/Card'
import { NavigationButtons } from '../components/NavigationButtons'
import type { StepProps } from '../../lib/types'
import { PartyPopper } from 'lucide-react'

export const CompletionStep: FC<StepProps> = ({
  onNext,
  onBack,
  onSkip,
  canGoBack,
  isLastStep,
}) => {
  return (
    <section aria-labelledby="completion-heading">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <PartyPopper
              className="w-16 h-16 text-primary"
              aria-hidden="true"
            />
          </div>
          <h1
            id="completion-heading"
            className="text-3xl sm:text-4xl font-bold mb-4 text-center"
          >
            You&apos;re All Set!
          </h1>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <p className="text-base sm:text-lg text-center text-muted-foreground">
              You&apos;ve learned about:
            </p>
            <ul className="space-y-2 max-w-md mx-auto">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>The Dashboard for tracking all your progress</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Progress tracking with charts and analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Managing tasks with the Todo list</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Setting long-term goals with Paths</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Visualizing progress with Photos</span>
              </li>
            </ul>
            <p className="text-base sm:text-lg text-center text-muted-foreground mt-6">
              Ready to start tracking your progress? Let&apos;s go to your
              dashboard!
            </p>
          </div>

          <NavigationButtons
            onNext={onNext}
            onBack={onBack}
            onSkip={onSkip}
            canGoBack={canGoBack}
            isLastStep={isLastStep}
          />
        </CardContent>
      </Card>
    </section>
  )
}
