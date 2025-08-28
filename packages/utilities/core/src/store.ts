export type StoreListener = VoidFunction

export type StoreCompareFn<T> = (a: T, b: T) => boolean

export function createStore<T extends Record<string, any>>(
  initialState: T,
  compare: StoreCompareFn<T> = Object.is,
): Store<T> {
  let state = { ...initialState }
  const listeners: Set<StoreListener> = new Set()

  const subscribe = (listener: StoreListener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  const publish = () => {
    listeners.forEach((listener) => listener())
  }

  const get = <K extends keyof T>(key: K): T[K] => {
    return state[key]
  }

  const set = <K extends keyof T>(key: K, value: T[K]) => {
    if (!compare(state[key], value)) {
      state[key] = value
      publish()
    }
  }

  const update = (updates: Partial<T>) => {
    let hasChanges = false
    for (const key in updates) {
      const value = updates[key]
      if (value !== undefined && !compare(state[key], value)) {
        state[key] = value
        hasChanges = true
      }
    }
    if (hasChanges) {
      publish()
    }
  }

  const snapshot = () => ({ ...state })

  return {
    subscribe,
    get,
    set,
    update,
    snapshot,
  }
}

export interface Store<T extends Record<string, any>> {
  subscribe: (listener: StoreListener) => () => void
  get: <K extends keyof T>(key: K) => T[K]
  set: <K extends keyof T>(key: K, value: T[K]) => void
  update: (updates: Partial<T>) => void
  snapshot: () => T
}
