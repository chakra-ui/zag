import { onMounted, onUnmounted, readonly, shallowRef, type ShallowRef } from "vue"

export function useSyncExternalStore<T>(
  subscribe: (listener: () => void) => () => void,
  getSnapshot: () => T,
  _getServerSnapshot?: () => T,
): Readonly<ShallowRef<T>> {
  const snapshot = shallowRef(getSnapshot()) as ShallowRef<T>
  let unsubscribe: (() => void) | undefined

  onMounted(() => {
    snapshot.value = getSnapshot()
    unsubscribe = subscribe(() => {
      snapshot.value = getSnapshot()
    })
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return readonly(snapshot) as Readonly<ShallowRef<T>>
}
