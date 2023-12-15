import { useEffect, useState } from "react"

export function useIsServer() {
  const [isServer, setIsServer] = useState(true)

  useEffect(() => {
    setIsServer(false)
  }, [])

  return isServer
}
