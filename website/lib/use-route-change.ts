import { useEffect } from "react"
import { useRouter } from "next/router"

export function useRouteChange(fn: (url: string) => void) {
  const router = useRouter()
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      fn(url)
    }
    router.events.on("routeChangeComplete", handleRouteChange)
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
