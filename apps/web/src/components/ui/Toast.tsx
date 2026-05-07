import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Toast as ToastType, onToastAdd, onToastRemove } from '@/lib/toast'

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastType[]>([])

  useEffect(() => {
    const unsub1 = onToastAdd((t) => setToasts(prev => [...prev, t]))
    const unsub2 = onToastRemove((id) => setToasts(prev => prev.filter(t => t.id !== id)))
    return () => { unsub1(); unsub2() }
  }, [])

  if (!toasts.length) return null

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
      ))}
    </div>,
    document.body
  )
}

function ToastItem({ toast, onClose }: { toast: ToastType; onClose: () => void }) {
  const icons = {
    success: <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />,
    error: <XCircle className="w-4 h-4 text-red-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />,
  }
  const borders = {
    success: 'border-green-900/50',
    error: 'border-red-900/50',
    info: 'border-blue-900/50',
    warning: 'border-yellow-900/50',
  }

  return (
    <div className={cn(
      'pointer-events-auto flex items-center gap-3 bg-[#111] border rounded-lg px-4 py-3 shadow-xl min-w-[280px] max-w-sm animate-slide-in',
      borders[toast.type]
    )}>
      {icons[toast.type]}
      <span className="text-sm text-white flex-1">{toast.message}</span>
      <button onClick={onClose} className="text-[#555] hover:text-white transition-colors ml-1">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
