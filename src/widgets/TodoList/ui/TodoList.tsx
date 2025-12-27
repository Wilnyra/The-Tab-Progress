import { type CheckedState } from '@radix-ui/react-checkbox'
import { type ComponentProps, useEffect, useState } from 'react'
import {
  selectAllTodo,
  type TodoData,
  TodoItem,
  updateTodo,
} from '@/entities/todo'
import { AddTodoDialog } from '@/features/todo/AddTodo'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/Card'

type TodoListProps = {
  cardProps?: ComponentProps<typeof Card>
}

export const TodoList = ({ cardProps }: TodoListProps) => {
  const [data, setData] = useState<TodoData[]>([])
  const [reload, setReload] = useState(false)

  useEffect(() => {
    selectAllTodo({ limit: 30 }).then(({ data }) => {
      setData(data)
    })
  }, [reload])

  const onUpdateTodo = async (id: TodoData['id'], checked: CheckedState) => {
    if (typeof checked === 'boolean') await updateTodo(id, { is_done: checked })
  }

  return (
    <Card {...cardProps}>
      <CardHeader className="flex justify-between flex-row items-start">
        <div className="space-y-1.5">
          <CardTitle>Todo</CardTitle>
          <CardDescription>
            These tasks will bring you to your aim
          </CardDescription>
        </div>

        <AddTodoDialog onComplete={() => setReload((prev) => !prev)} />
      </CardHeader>

      <CardContent>
        <div className="flex space-y-3 flex-col">
          {data.map(({ id, task }) => (
            <TodoItem
              id={id}
              key={id}
              task={task}
              onCheckedChange={(checked) => onUpdateTodo(id, checked)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
