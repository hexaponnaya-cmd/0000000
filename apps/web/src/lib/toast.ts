export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  message: string
}

type Listener = (toast: Toast) => void
type RemoveListener = (id: string) => void

const addListeners: Listener[] = []
const removeListeners: RemoveListener[] = []

function notify(type: ToastType, message: string) {
  const id = Math.random().toString(36).slice(2)
  const t: Toast = { id, type, message }
  addListeners.forEach(l => l(t))
  setTimeout(() => {
    removeListeners.forEach(l => l(id))
  }, 3500)
}

export const toast = {
  success: (msg: string) => notify('success', msg),
  error: (msg: string) => notify('error', msg),
  info: (msg: string) => notify('info', msg),
  warning: (msg: string) => notify('warning', msg),
}

export function onToastAdd(listener: Listener) {
  addListeners.push(listener)
  return () => {
    const i = addListeners.indexOf(listener)
    if (i >= 0) addListeners.splice(i, 1)
  }
}

export function onToastRemove(listener: RemoveListener) {
  removeListeners.push(listener)
  return () => {
    const i = removeListeners.indexOf(listener)
    if (i >= 0) removeListeners.splice(i, 1)
  }
}
