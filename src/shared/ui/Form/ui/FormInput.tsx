import type { ChangeEvent, ComponentProps, ReactNode } from 'react'
import { ControllerProps, useFormContext } from 'react-hook-form'
import { Input } from '../../Input'
import {
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
} from './Form'

type FormInputProps = Omit<ControllerProps, 'render'> &
  ComponentProps<typeof Input> & {
    label?: ReactNode
    transform?: (raw: string) => unknown
  }

export const FormInput = ({
  name,
  disabled,
  defaultValue,
  label,
  transform,
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
      render={({ field }) => {
        const handleChange = transform
          ? (e: ChangeEvent<HTMLInputElement>) =>
              field.onChange(transform(e.target.value))
          : field.onChange
        return (
          <FormItem>
            {label ? <FormLabel>{label}</FormLabel> : null}
            <FormControl>
              <Input {...field} {...props} onChange={handleChange} />
            </FormControl>
            <FormMessage>
              {context.formState.errors?.[name]?.message?.toString()}
            </FormMessage>
          </FormItem>
        )
      }}
    />
  )
}
