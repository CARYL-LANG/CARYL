import React from 'react'
import { toast } from '../hooks/use-toast'
import { ToastAction } from '../components/ui/toast'
import type { ToastActionElement } from '../components/ui/toast'

export interface NotificationOptions {
  title: string
  description?: string
  duration?: number
}

export interface ActionNotificationOptions extends NotificationOptions {
  actionLabel: string
  onAction: () => void
}

/**
 * Show a success notification
 */
export const showSuccessNotification = (options: NotificationOptions) => {
  toast({
    title: options.title,
    description: options.description,
    variant: 'default',
    duration: options.duration,
    className: 'bg-green-50 border-green-200 text-green-900',
  })
}

/**
 * Show an error/destructive notification
 */
export const showErrorNotification = (options: NotificationOptions) => {
  toast({
    title: options.title,
    description: options.description,
    variant: 'destructive',
    duration: options.duration,
    className: 'bg-red-50 border-red-200 text-red-900',
  })
}

/**
 * Show a warning notification
 */
export const showWarningNotification = (options: NotificationOptions) => {
  toast({
    title: options.title,
    description: options.description,
    variant: 'default',
    duration: options.duration,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  })
}

/**
 * Show an info notification
 */
export const showInfoNotification = (options: NotificationOptions) => {
  toast({
    title: options.title,
    description: options.description,
    variant: 'default',
    duration: options.duration,
    className: 'bg-blue-50 border-blue-200 text-blue-900',
  })
}

export const showActionNotification = (options: ActionNotificationOptions) => {
  toast({
    title: options.title,
    description: options.description,
    variant: 'default',
    duration: options.duration ?? 6000,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    action: React.createElement(
      ToastAction,
      {
        altText: options.actionLabel,
        onClick: options.onAction,
        className: 'bg-yellow-600 text-white border-yellow-700 hover:bg-yellow-700 hover:text-white',
      },
      options.actionLabel
    ) as unknown as ToastActionElement,
  })
}
