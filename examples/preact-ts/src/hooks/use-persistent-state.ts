import { useCallback, useEffect, useRef, useState } from "react"

export interface PersistentStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface UsePersistentStateProps<T> {
  key: string
  defaultValue: T
  storage?: PersistentStorage | null
  serialize?: (value: T) => string
  deserialize?: (raw: string) => T
}

const defaultStorage: PersistentStorage | null = typeof window !== "undefined" ? window.localStorage : null

export function usePersistentState<T>(props: UsePersistentStateProps<T>) {
  const { key, defaultValue, storage = defaultStorage, serialize = JSON.stringify, deserialize = JSON.parse } = props

  const optsRef = useRef({ storage, serialize, deserialize })
  optsRef.current = { storage, serialize, deserialize }

  const [state, setState] = useState(defaultValue)
  const [hydrated, setHydrated] = useState(false)

  // No-op before hydration so mount-time callbacks can't overwrite persisted state.
  const hydratedRef = useRef(hydrated)
  hydratedRef.current = hydrated

  useEffect(() => {
    const { storage, deserialize } = optsRef.current
    if (!storage) {
      setHydrated(true)
      return
    }
    try {
      const raw = storage.getItem(key)
      if (raw != null) setState(deserialize(raw))
    } catch {
      // Ignore access errors in private browsing or restricted environments.
    } finally {
      setHydrated(true)
    }
  }, [key])

  const setPersistentState = useCallback(
    (value: T | ((previous: T) => T)) => {
      if (!hydratedRef.current) return
      setState((previous) => {
        const nextValue = typeof value === "function" ? (value as (previous: T) => T)(previous) : value
        const { storage, serialize } = optsRef.current
        if (storage) {
          try {
            storage.setItem(key, serialize(nextValue))
          } catch {
            // Ignore access errors in private browsing or restricted environments.
          }
        }
        return nextValue
      })
    },
    [key],
  )

  return [state, setPersistentState, hydrated] as const
}

export interface UsePersistentMapStateProps<T> {
  storageKey: string
  key: string
  defaultValue: T
  storage?: PersistentStorage | null
}

export function usePersistentMapState<T>(props: UsePersistentMapStateProps<T>) {
  const { storageKey, key, defaultValue, storage } = props

  const [map, setMap, hydrated] = usePersistentState<Record<string, T>>({
    key: storageKey,
    defaultValue: {},
    storage,
  })

  const value = map[key] ?? defaultValue

  const defaultValueRef = useRef(defaultValue)
  defaultValueRef.current = defaultValue

  const setValue = useCallback(
    (next: T | ((previous: T) => T)) => {
      setMap((previousMap) => {
        const previousValue = previousMap[key] ?? defaultValueRef.current
        const resolved = typeof next === "function" ? (next as (previous: T) => T)(previousValue) : next
        return { ...previousMap, [key]: resolved }
      })
    },
    [setMap, key],
  )

  return [value, setValue, hydrated] as const
}
