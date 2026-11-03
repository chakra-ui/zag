import { createSignal, onSettled, type Accessor } from "solid-js"

export function useSyncExternalStore<T>(
  subscribe: (listener: () => void) => () => void,
  getSnapshot: () => T,
  _getServerSnapshot?: () => T,
): Accessor<T> {
  const initial = getSnapshot()
  const [snapshot, setSnapshot] = createSignal<T>(() => initial)

  onSettled(() => {
    setSnapshot(() => getSnapshot())
    return subscribe(() => {
      setSnapshot(() => getSnapshot())
    })
  })

  return snapshot
}
