"use client"

import { useMemo, useRef } from "react"

/** Create a value once for the component lifetime. */
export function useConst<T>(factory: () => T): T {
  const ref = useRef<T | undefined>(undefined)

  if (ref.current === undefined) {
    ref.current = factory()
  }

  return ref.current
}

/** Stable function identity that always calls the latest implementation. */
export function useStableFn<T extends (...args: any[]) => any>(fn: T): T {
  const ref = useRef(fn)
  ref.current = fn

  return useMemo(() => {
    return ((...args: any[]) => ref.current(...args)) as T
  }, [])
}
