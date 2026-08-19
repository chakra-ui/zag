import { useCallback, useRef } from "react"

type AnyFunction = (...args: any[]) => any

export function useEvent<T extends AnyFunction>(callback: T | undefined): T {
  const ref = useRef(callback)
  ref.current = callback
  return useCallback((...args: any[]) => ref.current?.(...args), []) as T
}
