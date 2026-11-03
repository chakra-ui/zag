import type { ComponentChildren } from "preact"
import { useEffect, useState } from "preact/hooks"

type ClientOnlyProps = {
  children: ComponentChildren
  /** Shown until the client has mounted (SSR and first paint skip `children`). */
  fallback?: ComponentChildren
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
