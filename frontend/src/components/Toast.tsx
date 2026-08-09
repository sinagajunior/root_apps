import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

// Simple toast store using a callback pattern
let toastCallbacks: ((toast: ToastMessage) => void)[] = []
let toastId = 0

export const useToast = () => {
  const [, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const callback = (toast: ToastMessage) => {
      setToasts((prev) => [...prev, toast])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, 3000)
    }

    toastCallbacks.push(callback)

    return () => {
      toastCallbacks = toastCallbacks.filter((cb) => cb !== callback)
    }
  }, [])

  return {
    success: (message: string) =>
      toastCallbacks.forEach((cb) => cb({ id: String(toastId++), message, type: 'success' })),
    error: (message: string) =>
      toastCallbacks.forEach((cb) => cb({ id: String(toastId++), message, type: 'error' })),
    info: (message: string) =>
      toastCallbacks.forEach((cb) => cb({ id: String(toastId++), message, type: 'info' })),
    warning: (message: string) =>
      toastCallbacks.forEach((cb) => cb({ id: String(toastId++), message, type: 'warning' })),
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const callback = (toast: ToastMessage) => {
      setToasts((prev) => [...prev, toast])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, 3000)
    }

    toastCallbacks.push(callback)

    return () => {
      toastCallbacks = toastCallbacks.filter((cb) => cb !== callback)
    }
  }, [])

  const bgColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'warning':
        return 'bg-yellow-500'
      default:
        return 'bg-blue-500'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${bgColor(toast.type)} text-white px-4 py-3 rounded-lg shadow-lg animate-bounce`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
