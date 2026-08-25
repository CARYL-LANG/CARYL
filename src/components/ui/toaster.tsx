'use client'

import { useToast } from '../../hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './toast'
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export function Toaster() {
  const { toasts } = useToast()

  const getIcon = (variant?: string | null, className?: string) => {
    const iconSize = 20
    const iconClass = 'flex-shrink-0'

    if (className?.includes('bg-green-50')) {
      return <CheckCircle2 size={iconSize} className={`${iconClass} text-green-600`} />
    } else if (className?.includes('bg-red-50')) {
      return <AlertCircle size={iconSize} className={`${iconClass} text-red-600`} />
    } else if (className?.includes('bg-yellow-50')) {
      return <AlertTriangle size={iconSize} className={`${iconClass} text-yellow-600`} />
    } else if (className?.includes('bg-blue-50')) {
      return <Info size={iconSize} className={`${iconClass} text-blue-600`} />
    }
    return null
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, className, ...props }) {
        return (
          <Toast key={id} className={className} {...props}>
            <div className="flex gap-3 flex-1">
              {getIcon(props.variant, className)}
              <div className="grid gap-1">
                {title && <ToastTitle className="font-semibold">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-sm opacity-90">{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
