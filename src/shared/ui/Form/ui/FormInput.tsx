import type { ComponentProps, ReactNode } from 'react'
import { ControllerProps, useFormContext } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
} from './Form'
import { Input } from '../../Input'

type FormInputProps = Omit<ControllerProps, 'render'> &
  ComponentProps<typeof Input> & {
    label?: ReactNode
  }

export const FormInput = ({
  name,
  disabled,
  defaultValue,
  label,
  ...props
}: FormInputProps) => {
  const context = useFormContext()
  if (!context) return null

  return (
    <FormField
      name={name}
      control={context.control}
      disabled={disabled}
      defaultValue={defaultValue}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <Input {...field} {...props} />
          </FormControl>
          <FormMessage>
            {context.formState.errors?.[name]?.message?.toString()}
          </FormMessage>
        </FormItem>
      )}
    />
  )
}
