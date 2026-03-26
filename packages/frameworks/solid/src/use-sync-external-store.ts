import { createSignal, onCleanup, onMount, type Accessor } from "solid-js"

export function useSyncExternalStore<T>(
  subscribe: (listener: () => void) => () => void,
  getSnapshot: () => T,
  _getServerSnapshot?: () => T,
): Accessor<T> {
  const [snapshot, setSnapshot] = createSignal(getSnapshot())

  onMount(() => {
    setSnapshot(() => getSnapshot())
    const unsubscribe = subscribe(() => {
      setSnapshot(() => getSnapshot())
    })

    onCleanup(unsubscribe)
  })

  return snapshot
}
