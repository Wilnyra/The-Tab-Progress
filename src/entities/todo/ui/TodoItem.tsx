import type { CheckedState } from '@radix-ui/react-checkbox'
import { Checkbox } from '@/shared/ui/Checkbox'

type TodoItemProps = {
  id: string
  task: string
  onCheckedChange: (checked: CheckedState) => void
}

export const TodoItem = ({ id, task, onCheckedChange }: TodoItemProps) => {
  return (
    <label
      htmlFor={id}
      className="flex items-center space-x-3 cursor-pointer py-3 -mx-2 px-2 rounded-md hover:bg-accent/50 active:bg-accent transition-colors"
    >
      <Checkbox
        id={id}
        onCheckedChange={(checked) => onCheckedChange(checked)}
      />
      <span className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1">
        {task}
      </span>
    </label>
  )
}
