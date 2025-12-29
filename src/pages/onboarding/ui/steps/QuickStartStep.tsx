import type { FC } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/shared/ui/Card'
import { NavigationButtons } from '../components/NavigationButtons'
import type { StepProps } from '../../lib/types'

export const QuickStartStep: FC<StepProps> = ({
  onNext,
  onBack,
  onSkip,
  canGoBack,
  isLastStep,
}) => {
  return (
    <section aria-labelledby="quickstart-heading">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle
            id="quickstart-heading"
            className="text-2xl sm:text-3xl font-bold text-center mb-2"
          >
            Get Started in 4 Simple Steps
          </CardTitle>
          <CardDescription className="text-center text-base sm:text-lg">
            Follow these steps to begin your progress tracking journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  Create Your First Progress Tracker
                </h3>
                <p className="text-sm text-muted-foreground">
                  Navigate to the Progress page and start logging your metrics.
                  Track anything from workout counts to study hours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  Add a Photo to Visualize Your Journey
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upload before and after photos to see your transformation over
                  time in the photo carousel.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  Set Up a Path for Your Long-Term Goal
                </h3>
                <p className="text-sm text-muted-foreground">
                  Define clear objectives and track your progress toward
                  achieving them over weeks or months.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  Add Your First Task to the Todo List
                </h3>
                <p className="text-sm text-muted-foreground">
                  Break down your goals into actionable tasks and check them off
                  as you complete them.
                </p>
              </div>
            </div>
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
