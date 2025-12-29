export type OnboardingStep = 0 | 1 | 2 | 3 | 4

export interface StepProps {
  readonly onNext: () => void
  readonly onBack: () => void
  readonly onSkip: () => void
  readonly canGoBack: boolean
  readonly isLastStep: boolean
}

export interface FeatureHighlight {
  readonly icon: string
  readonly title: string
  readonly description: string
}
