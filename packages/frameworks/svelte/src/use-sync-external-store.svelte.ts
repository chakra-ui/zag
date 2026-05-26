export function useSyncExternalStore<T>(
  subscribe: (listener: () => void) => () => void,
  getSnapshot: () => T,
  getServerSnapshot?: () => T,
): () => T {
  let snapshot = $state(
    getServerSnapshot !== undefined && typeof window === "undefined" ? getServerSnapshot() : getSnapshot(),
  )

  $effect(() => {
    snapshot = getSnapshot()
    const unsubscribe = subscribe(() => {
      snapshot = getSnapshot()
    })
    return unsubscribe
  })

  return () => snapshot
}
