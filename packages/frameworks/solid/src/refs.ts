import { createSignal } from "solid-js"

export function createRefs<T>(refs: T) {
  const [ref, setRef] = createSignal<T>(refs)
  return {
    get<K extends keyof T>(key: K): T[K] {
      return ref()[key]
    },
    set<K extends keyof T>(key: K, value: T[K]) {
      setRef((prev) => ({ ...prev, [key]: value }))
    },
  }
}
