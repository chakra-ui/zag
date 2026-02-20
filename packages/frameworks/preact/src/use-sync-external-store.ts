import { useSyncExternalStore as useSyncExternalStoreCompat } from "preact/compat"

export function useSyncExternalStore<T>(
  subscribe: (listener: () => void) => () => void,
  getSnapshot: () => T,
  _getServerSnapshot?: () => T,
): T {
  return useSyncExternalStoreCompat(subscribe, getSnapshot)
}
