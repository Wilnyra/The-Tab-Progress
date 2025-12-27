import { ComponentProps } from 'react'
import { AddProgressCommentDialog } from '@/features/progress/AddProgressComment'
import { GetProgressAnalytics } from '@/features/progress/GetProgressAnalytics'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/Card'

type ProgressCommentProps = {
  cardProps?: ComponentProps<typeof Card>
}

export const ProgressComment = ({ cardProps }: ProgressCommentProps) => {
  return (
    <Card {...cardProps}>
      <CardHeader>
        <CardTitle>Track Your Journey</CardTitle>
        <CardDescription>Comment your today's progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-center">
          <AddProgressCommentDialog />
          <GetProgressAnalytics />
        </div>
      </CardContent>
    </Card>
  )
}
