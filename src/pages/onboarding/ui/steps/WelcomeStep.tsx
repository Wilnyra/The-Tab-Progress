import type { FC } from 'react'
import type { StepProps } from '../../lib/types'
import { NavigationButtons } from '../components/NavigationButtons'
import { Card, CardHeader, CardContent } from '@/shared/ui/Card'

export const WelcomeStep: FC<StepProps> = ({
  onNext,
  onBack,
  onSkip,
  canGoBack,
  isLastStep,
}) => {
  return (
    <section aria-labelledby="welcome-heading">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <h1
            id="welcome-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-center"
          >
            Welcome to The Tab Progress
          </h1>
          <p className="text-lg sm:text-xl text-center text-muted-foreground mb-2">
            Track your life&apos;s progress, one tab at a time
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-base sm:text-lg text-center text-muted-foreground mb-6">
            The Tab Progress helps you organize your life into meaningful areas
            and track your progress across multiple dimensions. Whether
            it&apos;s personal goals, fitness milestones, learning objectives,
            or creative projects, keep everything in one place and watch your
            growth unfold.
          </p>
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
