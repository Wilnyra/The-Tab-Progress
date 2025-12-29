import type { FC } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card'
import { FeatureCard } from '../components/FeatureCard'
import { NavigationButtons } from '../components/NavigationButtons'
import type { StepProps, FeatureHighlight } from '../../lib/types'

const features: FeatureHighlight[] = [
  {
    icon: 'LayoutDashboard',
    title: 'Dashboard',
    description:
      'See all your progress at a glance with customizable widgets and visual insights',
  },
  {
    icon: 'TrendingUp',
    title: 'Progress Tracking',
    description:
      'Count, visualize, and analyze your progress over time with detailed charts',
  },
  {
    icon: 'CheckSquare',
    title: 'Todos',
    description: 'Manage tasks and action items to keep moving toward your goals',
  },
  {
    icon: 'Target',
    title: 'Paths',
    description: 'Define and track long-term objectives across different life areas',
  },
  {
    icon: 'Image',
    title: 'Photos',
    description:
      'Visual progress tracking with before and after photos in a carousel',
  },
  {
    icon: 'Settings',
    title: 'Settings',
    description:
      'Customize themes, date formats, and preferences to match your workflow',
  },
]

export const FeaturesStep: FC<StepProps> = ({
  onNext,
  onBack,
  onSkip,
  canGoBack,
  isLastStep,
}) => {
  return (
    <section aria-labelledby="features-heading">
      <Card>
        <CardHeader>
          <CardTitle
            id="features-heading"
            className="text-2xl sm:text-3xl font-bold text-center mb-4"
          >
            Powerful Features at Your Fingertips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
            {features.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
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
