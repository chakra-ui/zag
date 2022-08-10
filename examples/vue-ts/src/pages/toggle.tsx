import * as toggle from "@zag-js/toggle"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent } from "vue"
import { StateVisualizer } from "../components/state-visualizer"

export default defineComponent({
  name: "Toggle",
  setup() {
    const [state, send] = useMachine(toggle.machine({ id: "toggle", label: "Toggle italic" }))

    const apiRef = computed(() => toggle.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value
      return (
        <div>
          <button class="toggle" {...api.buttonProps}>
            B
          </button>
          <StateVisualizer state={state} />
        </div>
      )
    }
  },
})
