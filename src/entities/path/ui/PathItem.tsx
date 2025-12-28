import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { formatDate } from '@/shared/lib/formatDate'
import { Button } from '@/shared/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/DropdownMenu'

type PathItemProps = {
  id: string
  step: string
  createdAt: string
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  isLast: boolean
}

export const PathItem = ({
  id,
  step,
  createdAt,
  onEdit,
  onDelete,
  isLast,
}: PathItemProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const formattedDate = formatDate(createdAt)

  const isVisible = isHovered || isDropdownOpen

  const handleEdit = () => {
    setIsDropdownOpen(false)
    onEdit(id)
  }

  const handleDelete = () => {
    setIsDropdownOpen(false)
    onDelete(id)
  }

  return (
    <div
      className="flex items-start gap-3 relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isLast ? null : (
        <div className="absolute left-[3.25rem] top-8 bottom-0 w-0.5 bg-border" />
      )}

      <div className="flex-shrink-0 w-3 h-3 rounded-full bg-primary ring-4 ring-background z-10 mt-1.5" />

      <div className="flex-1 pb-6 pt-0 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm break-words">{step}</p>
            <div className="text-xs text-muted-foreground mt-1">
              {formattedDate}
            </div>
          </div>

          <div className="flex-shrink-0">
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'transition-opacity touch-visible',
                    isVisible && 'opacity-100',
                  )}
                  aria-label="Achievement options"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={handleEdit}
                  className="cursor-pointer"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
