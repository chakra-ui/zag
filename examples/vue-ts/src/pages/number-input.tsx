import * as numberInput from "@zag-js/number-input"
import { numberInputControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

import { Toolbar } from "../components/toolbar"

export default defineComponent({
  name: "NumberInput",
  setup() {
    const controls = useControls(numberInputControls)

    const [state, send] = useMachine(numberInput.machine({ id: "numberInput" }), {
      context: controls.context,
    })

    const apiRef = computed(() => numberInput.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main>
            <div {...api.rootProps}>
              <div data-testid="scrubber" {...api.scrubberProps} />
              <label data-testid="label" {...api.labelProps}>
                Enter number
              </label>
              <div {...api.controlProps}>
                <button data-testid="dec-button" {...api.decrementTriggerProps}>
                  DEC
                </button>
                <input data-testid="input" {...api.inputProps} />
                <button data-testid="inc-button" {...api.incrementTriggerProps}>
                  INC
                </button>
              </div>
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
