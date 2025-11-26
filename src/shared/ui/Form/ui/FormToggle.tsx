import type { ComponentProps } from 'react'
import {
  ControllerProps,
  useFormContext,
  type FieldValues,
  type Path,
  type PathValue,
} from 'react-hook-form'
import { Toggle } from '../../Toggle'
import { FormControl, FormField, FormItem, FormMessage } from './Form'

type FormToggleProps<Value extends FieldValues = FieldValues> = Omit<
  ControllerProps<Value> & {
    rules?: ComponentProps<typeof FormField>['rules']
    onPressedChange?: (val: PathValue<Value, Path<Value>> | boolean) => void
  },
  'render' | 'control'
> &
  Omit<
    ComponentProps<typeof Toggle>,
    keyof ControllerProps<Value> | 'value' | 'onPressedChange'
  > & {
    value?: PathValue<Value, Path<Value>>
  }

export const FormToggle = <Value extends FieldValues = FieldValues>({
  name,
  children,
  rules,
  disabled,
  onPressedChange,
  defaultPressed = false,
  value,
  shouldUnregister,
  ...props
}: FormToggleProps<Value>) => {
  const context = useFormContext<Value>()
  if (!context) return null

  let defaultValue: PathValue<Value, Path<Value>> | boolean = defaultPressed

  if (value !== undefined) {
    if (defaultPressed) defaultValue = value
  }

  return (
    <FormField<Value>
      control={context.control}
      defaultValue={defaultValue as PathValue<Value, Path<Value>>}
      disabled={disabled}
      name={name}
      render={({ field: { onChange: fieldOnChange, ...field } }) => (
        <FormItem className="flex flex-col">
          <FormControl>
            <Toggle
              {...field}
              {...props}
              onPressedChange={(pressed) => {
                if (pressed) {
                  if (value !== undefined) {
                    fieldOnChange(value)
                    onPressedChange?.(value)
                  } else {
                    fieldOnChange(true)
                    onPressedChange?.(true)
                  }
                } else {
                  fieldOnChange(false)
                  onPressedChange?.(false)
                }
              }}
              pressed={field.value !== false}
            >
              {children}
            </Toggle>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
      rules={rules}
      shouldUnregister={shouldUnregister}
    />
  )
}
