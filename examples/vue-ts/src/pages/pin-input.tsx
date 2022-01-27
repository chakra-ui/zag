import { injectGlobal } from "@emotion/css"
import * as PinInput from "@ui-machines/pin-input"
import { normalizeProps, useMachine, useSetup, VuePropTypes } from "@ui-machines/vue"
import { defineComponent } from "@vue/runtime-core"
import { useControls } from "../hooks/use-controls"
import { computed, h, Fragment } from "vue"
import { pinInputStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { pinInputControls } from "../../../../shared/controls"

injectGlobal(pinInputStyle)

export default defineComponent({
  name: "PinInput",
  setup() {
    const controls = useControls(pinInputControls)

    const [state, send] = useMachine(PinInput.machine, {
      context: controls.context,
    })

    const ref = useSetup({ send, id: "1" })

    const pin = computed(() => PinInput.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      const { containerProps, getInputProps, clearValue } = pin.value
      return (
        <div>
          <controls.ui />
          <div class="pin-input" ref={ref} {...containerProps}>
            <input data-testid="input-1" {...getInputProps({ index: 0 })} />
            <input data-testid="input-2" {...getInputProps({ index: 1 })} />
            <input data-testid="input-3" {...getInputProps({ index: 2 })} />
          </div>

          <button data-testid="clear-button" onClick={clearValue}>
            Clear
          </button>

          <StateVisualizer state={state} />
        </div>
      )
    }
  },
})
