import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | number | Date, fmt = 'MMM d, yyyy'): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date)
    return format(d, fmt)
  } catch {
    return String(date)
  }
}

export function formatDateTime(date: string | number | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date)
    return format(d, 'MMM d, yyyy HH:mm:ss')
  } catch {
    return String(date)
  }
}

export function formatRelative(date: string | number | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : typeof date === 'number' ? new Date(date * 1000) : date
    return formatDistanceToNow(d, { addSuffix: true })
  } catch {
    return String(date)
  }
}

export function fromUnix(ts: number): Date {
  return new Date(ts * 1000)
}

export function formatUnix(ts: number, fmt = 'MMM d, yyyy HH:mm'): string {
  try {
    return format(new Date(ts * 1000), fmt)
  } catch {
    return String(ts)
  }
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + '…' : str
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) return navigator.clipboard.writeText(text)
  return new Promise((resolve, reject) => {
    try {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidDomain(domain: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(domain)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function parseFromAddress(from: string): { email: string; name?: string } {
  const match = from.match(/^(.+?)\s*<(.+?)>$/)
  if (match) return { name: match[1].trim(), email: match[2].trim() }
  return { email: from.trim() }
}
