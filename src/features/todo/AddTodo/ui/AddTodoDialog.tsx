import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  addTodoFormSchema,
  type AddTodoFormSchema,
} from '../model/addTodoFormSchema'
import { useAuth } from '@/entities/session/lib/useAuth'
import { insertTodo } from '@/entities/todo'
import { Button, buttonVariants } from '@/shared/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/Dialog'
import { FormInput, FormMessage } from '@/shared/ui/Form'
import { Form } from '@/shared/ui/Form'

type AddTodoDialog = {
  onComplete?: () => void
}

export const AddTodoDialog = ({ onComplete }: AddTodoDialog) => {
  const { session } = useAuth()
  const [open, setOpen] = useState(false)

  const formContext = useForm<AddTodoFormSchema>({
    resolver: zodResolver(addTodoFormSchema),
    defaultValues: {
      todo: '',
    },
  })

  const onSubmit = ({ todo }: AddTodoFormSchema) => {
    insertTodo(todo, session?.user.id || '').then(() => {
      setOpen(false)
      onComplete?.()
      formContext.reset()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        onClick={(e) => e.stopPropagation()}
        className={buttonVariants({ variant: 'default' })}
      >
        <Plus />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new Todo</DialogTitle>
          <DialogDescription>
            This action must bring you closer to your goal.
          </DialogDescription>
        </DialogHeader>

        <Form {...formContext}>
          <form onSubmit={formContext.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormInput name="todo" />

              <FormMessage className="text-destructive text-sm">
                {formContext.formState.errors.root?.serverError?.message}
              </FormMessage>

              <DialogFooter>
                <Button type="submit">Confirm</Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
