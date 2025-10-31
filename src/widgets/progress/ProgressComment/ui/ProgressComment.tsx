import { AddProgressCommentDialog } from '@/features/progress/AddProgressComment'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/Card'
import { ComponentProps } from 'react'

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
        </div>
      </CardContent>
    </Card>
  )
}
