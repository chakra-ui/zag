import { onUnmounted, ref } from "vue"
import { subscribe, snapshot } from "valtio/vanilla"

export const useSnapshot = <T extends object>(object: T) => {
  const state = ref({} as T)
  const unsubscribe = subscribe(object, () => {
    state.value = snapshot(object)
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return state
}
