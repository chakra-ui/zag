import { mergeProps } from "@zag-js/core"
import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@zag-js/vue"
import { defineComponent } from "@vue/runtime-core"
import { useControls } from "../hooks/use-controls"
import { computed, h, Fragment } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { numberInputControls } from "../../../../shared/controls"
import { useId } from "../hooks/use-id"

export default defineComponent({
  name: "NumberInput",
  setup() {
    const controls = useControls(numberInputControls)

    const [state, send] = useMachine(numberInput.machine, {
      context: controls.context,
    })

    const ref = useSetup({ send, id: useId() })

    const apiRef = computed(() => numberInput.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <controls.ui />
          <div {...api.rootProps} ref={ref}>
            <div
              data-testid="scrubber"
              {...mergeProps(api.scrubberProps, { style: { width: "32px", height: "32px", background: "red" } })}
            />
            <label data-testid="label" {...api.labelProps}>
              Enter number
            </label>
            <div>
              <button data-testid="dec-button" {...api.decrementButtonProps}>
                DEC
              </button>
              <input data-testid="input" {...api.inputProps} />
              <button data-testid="inc-button" {...api.incrementButtonProps}>
                INC
              </button>
            </div>
            <StateVisualizer state={state} />
          </div>
        </>
      )
    }
  },
})
