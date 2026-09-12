import { Eye, EyeOff } from 'lucide-react'
import {
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { useFormContext, type ControllerProps } from 'react-hook-form'
import { cn } from '../../../lib/cn'
import { Input } from '../../Input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './Form'

type FormPasswordInputProps = Omit<ControllerProps, 'render'> &
  Omit<ComponentProps<typeof Input>, 'type'> & {
    label?: ReactNode
    labelAction?: ReactNode
  }

const keepInputFocus = (e: MouseEvent<HTMLButtonElement>): void => {
  e.preventDefault()
}

export const FormPasswordInput = ({
  name,
  disabled,
  defaultValue,
  label,
  labelAction,
  className,
  ...props
}: FormPasswordInputProps): JSX.Element | null => {
  const context = useFormContext()
  const [isVisible, setIsVisible] = useState(false)

  const handleToggle = (): void => {
    setIsVisible((prev) => !prev)
  }

  if (!context) return null

  return (
    <FormField
      name={name}
      control={context.control}
      disabled={disabled}
      defaultValue={defaultValue}
      render={({ field }) => (
        <FormItem>
          {label || labelAction ? (
            <div className="flex items-center justify-between gap-2">
              {label ? <FormLabel>{label}</FormLabel> : null}
              {labelAction}
            </div>
          ) : null}
          <div className="relative">
            <FormControl>
              <Input
                {...field}
                {...props}
                type={isVisible ? 'text' : 'password'}
                className={cn('pr-12 sm:pr-10', className)}
              />
            </FormControl>
            <button
              type="button"
              onClick={handleToggle}
              onMouseDown={keepInputFocus}
              aria-label="Show password"
              aria-pressed={isVisible}
              disabled={disabled}
              className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:w-9"
            >
              {isVisible ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          <FormMessage>
            {context.formState.errors?.[name]?.message?.toString()}
          </FormMessage>
        </FormItem>
      )}
    />
  )
}
