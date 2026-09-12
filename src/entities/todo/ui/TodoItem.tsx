import type { CheckedState } from '@radix-ui/react-checkbox'
import { cn } from '@/shared/lib/cn'
import { Checkbox } from '@/shared/ui/Checkbox'

type TodoItemProps = {
  id: string
  task: string
  checked: boolean
  onCheckedChange: (checked: CheckedState) => void
}

export const TodoItem = ({
  id,
  task,
  checked,
  onCheckedChange,
}: TodoItemProps): JSX.Element => {
  return (
    <label
      htmlFor={id}
      className="flex items-center space-x-3 cursor-pointer py-3 -mx-2 px-2 rounded-md hover:bg-accent/50 active:bg-accent transition-colors"
    >
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <span
        className={cn(
          'text-sm leading-none flex-1 transition-colors',
          checked ? 'text-muted-foreground line-through' : null,
        )}
      >
        {task}
      </span>
    </label>
  )
}
