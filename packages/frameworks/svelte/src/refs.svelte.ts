export function useRefs<T>(refs: T) {
  const ref = $state({ current: refs })
  return {
    get<K extends keyof T>(key: K): T[K] {
      return ref.current[key]
    },
    set<K extends keyof T>(key: K, value: T[K]) {
      ref.current[key] = value
    },
  }
}
