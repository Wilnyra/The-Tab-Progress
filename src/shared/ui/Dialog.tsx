import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
} from 'react'
import { cn } from '../lib/cn'

const useKeyboardInset = () => {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      document.documentElement.style.setProperty(
        '--keyboard-inset',
        `${inset}px`,
      )
    }

    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    update()

    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      document.documentElement.style.setProperty('--keyboard-inset', '0px')
    }
  }, [])
}

const HISTORY_STATE_KEY = '__dialogDepth'

type OpenDialogEntry = {
  depth: number
  close: () => void
}

const openDialogs = new Set<OpenDialogEntry>()

const readDialogDepth = (state: unknown): number => {
  if (typeof state !== 'object' || state === null) return 0
  if (!(HISTORY_STATE_KEY in state)) return 0
  const depth = state[HISTORY_STATE_KEY]
  return typeof depth === 'number' ? depth : 0
}

const handleHistoryPop = (event: PopStateEvent): void => {
  const depth = readDialogDepth(event.state)
  openDialogs.forEach((entry) => {
    if (entry.depth > depth) entry.close()
  })
}

const useCloseOnHistoryBack = (open: boolean, onClose: () => void): void => {
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return

    const depths = Array.from(openDialogs, (entry) => entry.depth)
    const entry: OpenDialogEntry = {
      depth: Math.max(0, ...depths) + 1,
      close: () => onCloseRef.current(),
    }
    if (openDialogs.size === 0) {
      window.addEventListener('popstate', handleHistoryPop)
    }
    openDialogs.add(entry)

    const base: unknown = window.history.state
    const marker = { [HISTORY_STATE_KEY]: entry.depth }
    window.history.pushState(
      typeof base === 'object' && base !== null
        ? { ...base, ...marker }
        : marker,
      '',
    )

    return () => {
      openDialogs.delete(entry)
      if (openDialogs.size === 0) {
        window.removeEventListener('popstate', handleHistoryPop)
      }
      if (readDialogDepth(window.history.state) === entry.depth) {
        window.history.back()
      }
    }
  }, [open])
}

type DialogProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Root>

const Dialog = ({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: DialogProps): JSX.Element => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolledOpen

  const handleOpenChange = useCallback(
    (next: boolean): void => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )

  const handleHistoryBack = useCallback(
    (): void => handleOpenChange(false),
    [handleOpenChange],
  )

  useCloseOnHistoryBack(open, handleHistoryBack)

  return (
    <DialogPrimitive.Root
      {...props}
      open={open}
      onOpenChange={handleOpenChange}
    />
  )
}

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  useKeyboardInset()
  return (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 grid w-full gap-4 border bg-background p-6 shadow-lg duration-200',
        'inset-x-0 bottom-[var(--keyboard-inset,0px)] rounded-t-2xl border-b-0 pb-[max(2.5rem,calc(env(safe-area-inset-bottom)+1rem))]',
        'sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:border-b sm:pb-6',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:slide-out-to-bottom-[100%] data-[state=open]:slide-in-from-bottom-[100%]',
        'sm:data-[state=closed]:slide-out-to-bottom-8 sm:data-[state=open]:slide-in-from-bottom-8',
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        onClick={(e) => e.stopPropagation()}
        aria-label="Close"
        className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className,
    )}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
      className,
    )}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className,
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
