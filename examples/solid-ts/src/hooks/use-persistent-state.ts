import { createMemo, createSignal, onMount, type Accessor } from "solid-js"

const getStorage = () => (typeof window !== "undefined" ? window.localStorage : null)

export interface UsePersistentMapStateProps<T> {
  storageKey: string
  key: Accessor<string>
  defaultValue: T
}

export function usePersistentMapState<T>(props: UsePersistentMapStateProps<T>) {
  const [map, setMap] = createSignal<Record<string, T>>({})
  const [hydrated, setHydrated] = createSignal(false)

  onMount(() => {
    try {
      const raw = getStorage()?.getItem(props.storageKey)
      if (raw != null) setMap(JSON.parse(raw))
    } catch {
      // Ignore access errors in restricted environments
    } finally {
      setHydrated(true)
    }
  })

  const value = createMemo(() => map()[props.key()] ?? props.defaultValue)

  // No-op before hydration so mount-time callbacks can't overwrite persisted state
  const setValue = (next: T) => {
    if (!hydrated()) return
    const nextMap = { ...map(), [props.key()]: next }
    setMap(nextMap)
    try {
      getStorage()?.setItem(props.storageKey, JSON.stringify(nextMap))
    } catch {
      // Ignore access errors in restricted environments
    }
  }

  return [value, setValue, hydrated] as const
}
