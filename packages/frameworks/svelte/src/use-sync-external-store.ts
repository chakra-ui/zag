import { readable, type Readable } from "svelte/store"

export function useSyncExternalStore<T>(
  subscribe: (listener: () => void) => () => void,
  getSnapshot: () => T,
  _getServerSnapshot?: () => T,
): Readable<T> {
  return readable(getSnapshot(), (set) => {
    set(getSnapshot())
    return subscribe(() => {
      set(getSnapshot())
    })
  })
}
