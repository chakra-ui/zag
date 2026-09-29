import { createSignal, onSettled, type Accessor } from "solid-js"

export function useSyncExternalStore<T>(
  subscribe: (listener: () => void) => () => void,
  getSnapshot: () => T,
  _getServerSnapshot?: () => T,
): Accessor<T> {
  const [snapshot, setSnapshot] = createSignal<any>(getSnapshot())

  onSettled(() => {
    setSnapshot(() => getSnapshot())
    return subscribe(() => {
      setSnapshot(() => getSnapshot())
    })
  })

  return snapshot
}
