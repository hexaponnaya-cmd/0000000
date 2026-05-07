export function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 140 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="32" height="32" rx="7" fill="url(#logoGrad)"/>
      <path d="M19 4L9 18h8l-4 10L24 14h-8l3-10z" fill="white"/>
      <text x="42" y="23" fontFamily="-apple-system, BlinkMacSystemFont, Inter, sans-serif" fontSize="18" fontWeight="700" fill="white" letterSpacing="1.5">LEGSEND</text>
    </svg>
  )
}
