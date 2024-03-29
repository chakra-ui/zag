import { useRef } from "preact/hooks"

export function useConstant<T>(fn: () => T): T {
  const ref = useRef<{ v: T }>()
  if (!ref.current) ref.current = { v: fn() }
  return ref.current.v
}
