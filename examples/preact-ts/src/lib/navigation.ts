import { useLocation } from "preact-iso"
import { useEffect, useState } from "preact/hooks"

// Stand-ins for the `next/navigation` hooks the shared examples use

export function useRouter() {
  const location = useLocation()
  return {
    push: (url: string) => location.route(url),
    replace: (url: string) => location.route(url, true),
    back: () => location.back(),
  }
}

export function usePathname() {
  return useLocation().path
}

// Prerendered HTML has no query string, so hydration must render without it
let hydrating = typeof document !== "undefined" && !!document.querySelector("script[type=isodata]")

export function endHydration() {
  hydrating = false
}

export function useSearchParams() {
  const { url } = useLocation()
  const [hydrated, setHydrated] = useState(!hydrating)
  useEffect(() => setHydrated(true), [])
  return new URLSearchParams(hydrated ? (url.split("?")[1] ?? "") : "")
}
