import { createContext } from 'react'

export type ToastVariant = 'default' | 'error'

export type ToastDismissReason =
  | 'timeout'
  | 'action'
  | 'replaced'
  | 'pagehide'
  | 'unmount'

export type ToastAction = {
  label: string
  onClick: () => void
}

export type ToastOptions = {
  message: string
  variant?: ToastVariant
  action?: ToastAction
  duration?: number
  onDismiss?: (reason: ToastDismissReason) => void
}

export type ToastContextValue = {
  showToast: (options: ToastOptions) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
