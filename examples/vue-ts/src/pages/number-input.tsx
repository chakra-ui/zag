import { mergeProps } from "@ui-machines/core"
import * as NumberInput from "@ui-machines/number-input"
import { normalizeProps, useMachine, useSetup, VuePropTypes } from "@ui-machines/vue"
import { defineComponent } from "@vue/runtime-core"
import { useControls } from "../hooks/use-controls"
import { computed, h, Fragment } from "vue"
import { StateVisualizer } from "../components/state-visualizer"

export default defineComponent({
  name: "NumberInput",
  setup() {
    const controls = useControls({
      clampValueOnBlur: { type: "boolean", defaultValue: true },
      step: { type: "number", defaultValue: 1 },
      precision: { type: "number", defaultValue: 0 },
      min: { type: "number", defaultValue: 0 },
      max: { type: "number", defaultValue: 10 },
    })

    const [state, send] = useMachine(NumberInput.machine, {
      context: controls.context,
    })

    const numberInputRef = computed(() => NumberInput.connect<VuePropTypes>(state.value, send, normalizeProps))

    const ref = useSetup({ send, id: "1" })

    return () => {
      const { decrementButtonProps, incrementButtonProps, inputProps, scrubberProps, labelProps } = numberInputRef.value

      return (
        <>
          <controls.ui />
          <div>
            <div {...mergeProps(scrubberProps, { style: { width: "32px", height: "32px", background: "red" } })} />
            <label {...labelProps}>Enter number</label>
            <div>
              <button {...decrementButtonProps}>DEC</button>
              <input ref={ref} {...inputProps} />
              <button {...incrementButtonProps}>INC</button>
            </div>
            <StateVisualizer state={state.value} />
          </div>
        </>
      )
    }
  },
})
