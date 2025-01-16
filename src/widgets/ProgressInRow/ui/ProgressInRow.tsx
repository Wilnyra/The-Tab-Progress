import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/Card'
import { type ComponentProps } from 'react'

type ProgressInRowProps = {
  cardProps?: ComponentProps<typeof Card>
}

export const ProgressInRow = ({ cardProps }: ProgressInRowProps) => {
  return (
    <Card {...cardProps}>
      <CardHeader>
        <CardTitle>Progress In Row</CardTitle>
        <CardDescription>Do not interrupt the duration</CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <h2 className="text-center scroll-m-20 text-3xl font-semibold transition-colors">
          🔥 30 days
        </h2>
      </CardContent>
    </Card>
  )
}
