import type {
  ChangeEvent,
  ComponentProps,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react'
import type { ControllerProps, FieldValues } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'
import { cn } from '@/shared/lib/cn'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './Form'

export type FormTextareaProps<Value extends FieldValues = FieldValues> = Omit<
  ControllerProps<Value>,
  'render' | 'control'
> &
  Omit<
    ComponentProps<'textarea'>,
    keyof ControllerProps<Value> | 'onChange'
  > & {
    label?: ReactNode
    className?: string
    description?: ReactNode
    onChange?: (
      value: TextareaHTMLAttributes<HTMLTextAreaElement>['value'],
      event: ChangeEvent<HTMLTextAreaElement>,
    ) => void
  }

export const FormTextarea = <Value extends FieldValues = FieldValues>({
  rules,
  className,
  shouldUnregister,
  disabled,
  defaultValue,
  name,
  label,
  description,
  onBlur,
  onChange,
  ...props
}: FormTextareaProps<Value>) => {
  const context = useFormContext<Value>()

  if (!context) return null

  return (
    <FormField<Value>
      name={name}
      control={context.control}
      disabled={disabled}
      defaultValue={defaultValue}
      rules={rules}
      shouldUnregister={shouldUnregister}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel>{label}</FormLabel> : null}

          <FormControl>
            <textarea
              data-slot="textarea"
              className={cn(
                'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                className,
              )}
              {...field}
              {...props}
            />
          </FormControl>

          <FormMessage>
            {context.formState.errors?.[name]?.message?.toString()}
          </FormMessage>

          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}
        </FormItem>
      )}
    />
  )
}
