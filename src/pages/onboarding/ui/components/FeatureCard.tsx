import * as LucideIcons from 'lucide-react'
import type { FC } from 'react'
import type { FeatureHighlight } from '../../lib/types'
import { Card, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card'

interface FeatureCardProps {
  readonly feature: FeatureHighlight
}

export const FeatureCard: FC<FeatureCardProps> = ({ feature }) => {
  const Icon = LucideIcons[
    feature.icon as keyof typeof LucideIcons
  ] as FC<{ className?: string }>

  return (
    <Card className="h-full">
      <CardHeader>
        <Icon className="w-10 h-10 mb-3 text-primary" aria-hidden="true" />
        <CardTitle className="text-lg">{feature.title}</CardTitle>
        <CardDescription>{feature.description}</CardDescription>
      </CardHeader>
    </Card>
  )
}
