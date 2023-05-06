import * as toggle from "@zag-js/toggle"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "src/components/toolbar"

export default defineComponent({
  name: "Toggle",
  setup() {
    const [state, send] = useMachine(
      toggle.machine({
        id: "v1",
        "aria-label": "Toggle italic",
      }),
    )

    const apiRef = computed(() => toggle.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value
      return (
        <>
          <main class="toggle">
            <button {...api.buttonProps}>B</button>
          </main>

          <Toolbar viz>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})
