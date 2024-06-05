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

    const [state, send] = useMachine(numberInput.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => numberInput.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main>
            <div {...api.getRootProps()}>
              <div data-testid="scrubber" {...api.getScrubberProps()} />
              <label data-testid="label" {...api.getLabelProps()}>
                Enter number
              </label>
              <div {...api.getControlProps()}>
                <button data-testid="dec-button" {...api.getDecrementTriggerProps()}>
                  DEC
                </button>
                <input data-testid="input" {...api.getInputProps()} />
                <button data-testid="inc-button" {...api.getIncrementTriggerProps()}>
                  INC
                </button>
              </div>
            </div>
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} omit={["formatter", "parser"]} />
          </Toolbar>
        </>
      )
    }
  },
})
