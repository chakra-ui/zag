import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

export function useRouteChange(fn: (url: string) => void) {
  const pathname = usePathname()
  const previousPathnameRef = useRef<string | null>(null)

  useEffect(() => {
    if (
      previousPathnameRef.current !== undefined &&
      previousPathnameRef.current !== pathname
    ) {
      fn(pathname)
    }
    previousPathnameRef.current = pathname
  }, [pathname, fn])
}
