import { useLocation } from "preact-iso"

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

export function useSearchParams() {
  const { url } = useLocation()
  return new URLSearchParams(url.split("?")[1] ?? "")
}
