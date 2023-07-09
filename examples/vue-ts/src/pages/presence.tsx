import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, ref, watchEffect, type Ref, watch } from "vue"

function usePresence(present: Ref<boolean>) {
  const [state, send, service] = useMachine(presence.machine({ present: present.value }))

  watchEffect(() => {
    service.setContext({ present: present.value })
  })

  return computed(() => presence.connect(state.value, send, normalizeProps))
}

export default defineComponent({
  name: "presence",
  setup() {
    const present = ref(false)
    const apiRef = usePresence(present)
    const nodeRef = ref<HTMLElement | null>(null)

    watch(nodeRef, () => {
      apiRef.value.setNode(nodeRef.value)
    })

    return () => {
      const api = apiRef.value
      return (
        <main class="presence">
          <button onClick={() => (present.value = !present.value)}>Toggle</button>
          {api.isPresent && (
            <div ref={nodeRef} data-scope="presence" data-state={present.value ? "open" : "closed"}>
              Content
            </div>
          )}
        </main>
      )
    }
  },
})
