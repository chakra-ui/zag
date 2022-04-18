import { computed, onBeforeMount, onMounted, ref } from "vue"

let serverHandoffComplete = false
let _id = 0
const genId = () => ++_id

/**
 * Generates a unique id
 */
export const useId = () => {
  const initialId = serverHandoffComplete ? genId() : null
  const idRef = ref(initialId)

  onBeforeMount(() => {
    if (serverHandoffComplete === false) {
      serverHandoffComplete = true
    }
  })

  onMounted(() => {
    if (idRef.value === null) {
      idRef.value = genId()
    }
  })

  return computed(() => {
    const id = idRef.value !== null ? idRef.value.toString() : undefined
    return `v:${id}`
  })
}
