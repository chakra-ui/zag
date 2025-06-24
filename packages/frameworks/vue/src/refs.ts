import { ref } from "vue"

export function useRefs<T>(refs: T) {
  const __refs = ref(refs)
  return {
    get<K extends keyof T>(key: K): T[K] {
      return __refs.value[key]
    },
    set<K extends keyof T>(key: K, value: T[K]) {
      __refs.value[key] = value
    },
  }
}
