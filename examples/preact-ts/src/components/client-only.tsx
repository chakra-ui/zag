import { useEffect, useState, type ReactNode } from "react"

type ClientOnlyProps = {
  children: ReactNode
  /** Shown until the client has mounted (SSR and first paint skip `children`). */
  fallback?: ReactNode
}

/**
 * Renders `children` only after mount so browser-only APIs (e.g. `window`, portals)
 * and classes that depend on them are not executed during SSR.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <>{fallback}</>
  return <>{children}</>
}
