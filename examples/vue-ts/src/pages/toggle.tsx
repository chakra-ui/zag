import { injectGlobal } from "@emotion/css"
import { normalizeProps, useMachine } from "@zag-js/vue"
import * as toggle from "@zag-js/toggle"
import { toggleStyle } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { computed, defineComponent, h, Fragment } from "vue"

injectGlobal(toggleStyle)

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
