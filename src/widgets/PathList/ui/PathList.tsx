import { type ComponentProps, useEffect, useState } from 'react'
import {
  selectAllPath,
  type PathData,
  PathItem,
  PathEmptyState,
} from '@/entities/path'
import { AddPathDialog } from '@/features/path/AddPath'
import { EditPathDialog } from '@/features/path/EditPath'
import { DeletePathDialog } from '@/features/path/DeletePath'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/Card'

type PathListProps = {
  cardProps?: ComponentProps<typeof Card>
}

export const PathList = ({ cardProps }: PathListProps) => {
  const [data, setData] = useState<PathData[]>([])
  const [reload, setReload] = useState(false)
  const [editingPath, setEditingPath] = useState<{
    id: string
    step: string
  } | null>(null)
  const [deletingPath, setDeletingPath] = useState<{
    id: string
    step: string
  } | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    selectAllPath({ limit: 5 }).then(({ data }) => {
      setData(data || [])
    })
  }, [reload])

  const handleEdit = (id: string, step: string) => {
    setEditingPath({ id, step })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (id: string, step: string) => {
    setDeletingPath({ id, step })
    setIsDeleteDialogOpen(true)
  }

  const handleComplete = () => {
    setReload((prev) => !prev)
  }

  if (data.length === 0) {
    return (
      <Card {...cardProps}>
        <CardHeader className="flex justify-between flex-row items-start">
          <div className="space-y-1.5">
            <CardTitle>Path</CardTitle>
            <CardDescription>Track your journey milestones</CardDescription>
          </div>
          <AddPathDialog onComplete={handleComplete} />
        </CardHeader>
        <CardContent>
          <PathEmptyState />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card {...cardProps}>
        <CardHeader className="flex justify-between flex-row items-start">
          <div className="space-y-1.5">
            <CardTitle>Path</CardTitle>
            <CardDescription>Track your journey milestones</CardDescription>
          </div>
          <AddPathDialog onComplete={handleComplete} />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            {data.map(({ id, step, created_at }, index) => (
              <PathItem
                key={id}
                id={id}
                step={step}
                createdAt={created_at}
                onEdit={() => handleEdit(id, step)}
                onDelete={() => handleDelete(id, step)}
                isLast={index === data.length - 1}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <EditPathDialog
        pathId={editingPath?.id || ''}
        currentStep={editingPath?.step || ''}
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setTimeout(() => setEditingPath(null), 300)
          }
        }}
        onComplete={() => {
          setIsEditDialogOpen(false)
          setTimeout(() => {
            setEditingPath(null)
            handleComplete()
          }, 300)
        }}
      />

      <DeletePathDialog
        pathId={deletingPath?.id || ''}
        step={deletingPath?.step || ''}
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
          if (!open) {
            setTimeout(() => setDeletingPath(null), 300)
          }
        }}
        onComplete={() => {
          setIsDeleteDialogOpen(false)
          setTimeout(() => {
            setDeletingPath(null)
            handleComplete()
          }, 300)
        }}
      />
    </>
  )
}
