import { computed, onBeforeMount, onMounted, ref } from "vue"

let serverHandoffComplete = false
let _id = 0
const genId = () => ++_id

/**
 * Generates a unique id
 */
export const useId = () => {
  const initialId = serverHandoffComplete ? genId() : null
  const uid = ref(initialId)

  onBeforeMount(() => {
    if (serverHandoffComplete === false) {
      serverHandoffComplete = true
    }
  })

  onMounted(() => {
    if (uid.value === null) {
      uid.value = genId()
    }
  })

  return computed(() => {
    const __id__ = uid.value !== null ? uid.value.toString() : undefined
    return `v:${__id__}`
  })
}
