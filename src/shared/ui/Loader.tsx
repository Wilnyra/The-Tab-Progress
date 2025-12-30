import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

const loaderVariants = cva('animate-spin', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export interface LoaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loaderVariants> {
  text?: string
  fullScreen?: boolean
}

export const Loader = ({
  className,
  size,
  text,
  fullScreen = false,
  ...props
}: LoaderProps): JSX.Element => {
  const content = (
    <>
      <Loader2 className={cn(loaderVariants({ size }), className)} />
      {text ? (
        <span className="mt-2 text-sm text-muted-foreground">{text}</span>
      ) : null}
    </>
  )

  if (fullScreen) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center justify-center h-screen gap-2"
        {...props}
      >
        {content}
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-2"
      {...props}
    >
      {content}
    </div>
  )
}
