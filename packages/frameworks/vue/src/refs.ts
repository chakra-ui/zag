import { ref } from "vue"

export function useRefs<T>(refs: T) {
  const refsRef = ref(refs)
  return {
    get<K extends keyof T>(key: K): T[K] {
      return refsRef.value[key]
    },
    set<K extends keyof T>(key: K, value: T[K]) {
      refsRef.value[key] = value
    },
  }
}
