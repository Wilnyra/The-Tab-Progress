import type { FC } from 'react'
import type { StepProps } from '../lib/types'
import { useOnboardingState } from '../lib/useOnboardingState'
import { StepIndicator } from './components/StepIndicator'
import { CompletionStep } from './steps/CompletionStep'
import { DashboardStep } from './steps/DashboardStep'
import { FeaturesStep } from './steps/FeaturesStep'
import { QuickStartStep } from './steps/QuickStartStep'
import { WelcomeStep } from './steps/WelcomeStep'

export const OnboardingPage: FC = () => {
  const {
    currentStep,
    totalSteps,
    handleNext,
    handleBack,
    handleSkip,
    canGoBack,
    isLastStep,
  } = useOnboardingState()

  const stepProps: StepProps = {
    onNext: handleNext,
    onBack: handleBack,
    onSkip: handleSkip,
    canGoBack,
    isLastStep,
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <h2 className="sr-only">Onboarding</h2>
      <div className="w-full max-w-4xl">
        <StepIndicator current={currentStep} total={totalSteps} />

        <div className="mt-8">
          {currentStep === 0 ? <WelcomeStep {...stepProps} /> : null}
          {currentStep === 1 ? <FeaturesStep {...stepProps} /> : null}
          {currentStep === 2 ? <DashboardStep {...stepProps} /> : null}
          {currentStep === 3 ? <QuickStartStep {...stepProps} /> : null}
          {currentStep === 4 ? <CompletionStep {...stepProps} /> : null}
        </div>
      </div>
    </div>
  )
}
