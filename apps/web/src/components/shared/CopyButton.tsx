import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn, copyToClipboard } from '@/lib/utils'
import { toast } from '@/lib/toast'

interface CopyButtonProps {
  text: string
  className?: string
  size?: 'sm' | 'md'
  showText?: boolean
}

export function CopyButton({ text, className, size = 'sm', showText }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await copyToClipboard(text)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className={cn(
        'inline-flex items-center gap-1.5 text-[#555] hover:text-white transition-colors rounded',
        size === 'sm' ? 'p-1' : 'px-2 py-1 text-sm',
        className
      )}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      {showText && <span>{copied ? 'Copied' : 'Copy'}</span>}
    </button>
  )
}
