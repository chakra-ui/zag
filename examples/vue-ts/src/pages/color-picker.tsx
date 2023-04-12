import * as color-picker from "@zag-js/color-picker"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { color-pickerControls, color-pickerData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "color-picker",
  setup() {
    const controls = useControls(color-pickerControls)

    const [state, send] = useMachine(color-picker.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => color-picker.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="color-picker">
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
