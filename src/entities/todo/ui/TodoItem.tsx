import { Checkbox } from '@/shared/ui/Checkbox'
import type { CheckedState } from '@radix-ui/react-checkbox'

type TodoItemProps = {
  id: string
  task: string
  onCheckedChange: (checked: CheckedState) => void
}

export const TodoItem = ({ id, task, onCheckedChange }: TodoItemProps) => {
  return (
    <div className="flex items-center space-x-2" key={id}>
      <Checkbox
        id={id}
        onCheckedChange={(checked) => onCheckedChange(checked)}
      />

      <label
        htmlFor={id}
        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {task}
      </label>
    </div>
  )
}
