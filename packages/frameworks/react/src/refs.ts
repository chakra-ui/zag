"use client"

import { useRef } from "react"
import { useConst } from "./stable"

export function useRefs<T>(refs: T) {
  const ref = useRef(refs)

  return useConst(() => ({
    get<K extends keyof T>(key: K): T[K] {
      return ref.current[key]
    },
    set<K extends keyof T>(key: K, value: T[K]) {
      ref.current[key] = value
    },
  }))
}
