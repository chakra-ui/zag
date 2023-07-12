import { snapshot, subscribe } from "@zag-js/store"
import { onUnmounted, ref, type UnwrapRef } from "vue"

export const useSnapshot = <T extends object>(object: T) => {
  const state = ref({} as T)
  const unsubscribe = subscribe(object, () => {
    state.value = snapshot(object) as UnwrapRef<T>
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return state
}
