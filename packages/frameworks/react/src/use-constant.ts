import { useRef } from "react"

interface Result<T> {
  v: T
}

export function useConstant<T>(fn: () => T): T {
  const ref = useRef<Result<T>>()

  if (!ref.current) {
    ref.current = { v: fn() }
  }

  return ref.current.v
}
