import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'
import { cn } from '../../lib/cn'
import {
  ToastContext,
  type ToastContextValue,
  type ToastDismissReason,
  type ToastOptions,
} from './toastContext'

const DEFAULT_DURATION_MS = 5000

type ActiveToast = ToastOptions & { id: number }

type ToastViewProps = {
  toast: ActiveToast
  onAction: () => void
  onPause: () => void
  onResume: () => void
}

const ToastView = ({
  toast,
  onAction,
  onPause,
  onResume,
}: ToastViewProps): JSX.Element => (
  <div
    className={cn(
      'pointer-events-auto flex w-full items-center gap-2 rounded-lg py-1 pl-4 text-sm shadow-lg',
      'animate-in fade-in-0 slide-in-from-bottom-4 motion-reduce:animate-none',
      toast.action ? 'pr-1' : 'pr-4',
      toast.variant === 'error'
        ? 'bg-destructive text-destructive-foreground'
        : 'bg-foreground text-background',
    )}
    onMouseEnter={onPause}
    onMouseLeave={onResume}
    onFocus={onPause}
    onBlur={onResume}
  >
    <p className="flex-1 py-2.5">{toast.message}</p>
    {toast.action ? (
      <button
        type="button"
        onClick={onAction}
        className="inline-flex h-11 shrink-0 items-center rounded-md px-3 font-semibold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
      >
        {toast.action.label}
      </button>
    ) : null}
  </div>
)

export const ToastProvider = ({
  children,
}: PropsWithChildren): JSX.Element => {
  const [toast, setToast] = useState<ActiveToast | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const currentRef = useRef<ActiveToast | null>(null)
  const nextIdRef = useRef(0)

  const dismiss = useCallback((reason: ToastDismissReason): void => {
    const current = currentRef.current
    if (!current) return
    currentRef.current = null
    setToast(null)
    current.onDismiss?.(reason)
  }, [])

  const showToast = useCallback((options: ToastOptions): void => {
    const previous = currentRef.current
    nextIdRef.current += 1
    const next: ActiveToast = { ...options, id: nextIdRef.current }
    currentRef.current = next
    setToast(next)
    setIsPaused(false)
    previous?.onDismiss?.('replaced')
  }, [])

  const handleAction = useCallback((): void => {
    const action = currentRef.current?.action
    if (!action) return
    dismiss('action')
    action.onClick()
  }, [dismiss])

  const handlePause = useCallback((): void => setIsPaused(true), [])
  const handleResume = useCallback((): void => setIsPaused(false), [])

  useEffect(() => {
    if (!toast || isPaused) return
    const timer = window.setTimeout(() => {
      if (currentRef.current?.id === toast.id) dismiss('timeout')
    }, toast.duration ?? DEFAULT_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [toast, isPaused, dismiss])

  useEffect(() => {
    const handlePageHide = (): void => dismiss('pagehide')
    window.addEventListener('pagehide', handlePageHide)
    return () => {
      window.removeEventListener('pagehide', handlePageHide)
      dismiss('unmount')
    }
  }, [dismiss])

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast])

  const isError = toast?.variant === 'error'
  const view = toast ? (
    <ToastView
      key={toast.id}
      toast={toast}
      onAction={handleAction}
      onPause={handlePause}
      onResume={handleResume}
    />
  ) : null

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center px-4 pb-[max(1rem,calc(env(safe-area-inset-bottom)+0.5rem))]">
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="w-full max-w-md"
        >
          {isError ? null : view}
        </div>
        <div role="alert" aria-atomic="true" className="w-full max-w-md">
          {isError ? view : null}
        </div>
      </div>
    </ToastContext.Provider>
  )
}
