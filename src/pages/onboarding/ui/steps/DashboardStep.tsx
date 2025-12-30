import { LayoutDashboard, TrendingUp, CheckSquare, Image } from 'lucide-react'
import type { FC } from 'react'
import type { StepProps } from '../../lib/types'
import { NavigationButtons } from '../components/NavigationButtons'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/shared/ui/Card'

export const DashboardStep: FC<StepProps> = ({
  onNext,
  onBack,
  onSkip,
  canGoBack,
  isLastStep,
}) => {
  return (
    <section aria-labelledby="dashboard-heading">
      <Card>
        <CardHeader>
          <CardTitle
            id="dashboard-heading"
            className="text-2xl sm:text-3xl font-bold text-center mb-2"
          >
            Your Central Hub
          </CardTitle>
          <CardDescription className="text-center text-base sm:text-lg">
            The dashboard is your command center for all progress tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
              <LayoutDashboard
                className="w-8 h-8 text-primary flex-shrink-0"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-semibold mb-1">Widget-Based Layout</h3>
                <p className="text-sm text-muted-foreground">
                  Organize your dashboard with customizable widgets that show
                  the information you care about most
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
              <TrendingUp
                className="w-8 h-8 text-primary flex-shrink-0"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-semibold mb-1">Progress Cards</h3>
                <p className="text-sm text-muted-foreground">
                  View your progress metrics with charts, trends, and analytics
                  at a glance
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
              <CheckSquare
                className="w-8 h-8 text-primary flex-shrink-0"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-semibold mb-1">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">
                  Add todos, update paths, and log progress directly from your
                  dashboard
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
              <Image
                className="w-8 h-8 text-primary flex-shrink-0"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-semibold mb-1">Photo Carousel</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize your transformation with a rotating photo gallery
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
