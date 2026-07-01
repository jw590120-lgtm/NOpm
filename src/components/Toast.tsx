import { useState, useEffect, useCallback } from 'react'

interface ToastMessage {
  id: number
  text: string
  type: 'success' | 'error' | 'info'
}

let toastId = 0
let addToastExternal: ((msg: Omit<ToastMessage, 'id'>) => void) | null = null

export function showToast(text: string, type: ToastMessage['type'] = 'success') {
  addToastExternal?.({ text, type })
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  addToastExternal = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { ...msg, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2500)
  }, [])

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  if (toasts.length === 0) return null

  const colorMap = {
    success: 'bg-emerald-600',
    error: 'bg-red-500',
    info: 'bg-blue-600',
  }

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${colorMap[toast.type]} text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 pointer-events-auto animate-[slideUp_0.3s_ease-out]`}
        >
          <span>{toast.text}</span>
          <button onClick={() => dismiss(toast.id)} className="ml-1 opacity-60 hover:opacity-100">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
