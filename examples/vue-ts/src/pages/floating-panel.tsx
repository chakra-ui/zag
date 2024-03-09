import * as floating-panel from "@zag-js/floating-panel"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { floating-panelControls, floating-panelData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "floating-panel",
  setup() {
    const controls = useControls(floating-panelControls)

    const [state, send] = useMachine(floating-panel.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => floating-panel.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="floating-panel">
            <div {...api.rootProps}>
            
            </div>
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})
