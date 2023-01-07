import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { datePickerControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "datePicker",
  setup() {
    const controls = useControls(datePickerControls)

    const [state, send] = useMachine(datePicker.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => datePicker.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="date-picker">
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
