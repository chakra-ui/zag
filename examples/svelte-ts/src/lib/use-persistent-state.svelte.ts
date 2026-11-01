export interface UsePersistentMapStateProps<T> {
  storageKey: string
  key: () => string
  defaultValue: T
}

export function usePersistentMapState<T>(props: UsePersistentMapStateProps<T>) {
  const { storageKey, key, defaultValue } = props

  let map = $state<Record<string, T>>({})
  let hydrated = $state(false)

  $effect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw != null) map = JSON.parse(raw)
    } catch {
      // Ignore access errors in restricted environments
    } finally {
      hydrated = true
    }
  })

  return {
    get value() {
      return map[key()] ?? defaultValue
    },
    get hydrated() {
      return hydrated
    },
    // No-op before hydration so mount-time callbacks can't overwrite persisted state
    setValue(next: T) {
      if (!hydrated) return
      map = { ...map, [key()]: next }
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(map))
      } catch {
        // Ignore access errors in restricted environments
      }
    },
  }
}
