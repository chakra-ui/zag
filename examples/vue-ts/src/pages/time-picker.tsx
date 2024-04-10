import * as timePicker from "@zag-js/time-picker"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { timePickerControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "timePicker",
  setup() {
    const controls = useControls(timePickerControls)

    const [state, send] = useMachine(timePicker.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => timePicker.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="time-picker">
            <div {...api.rootProps}></div>
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})
