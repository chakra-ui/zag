import { injectGlobal } from "@emotion/css"
import * as PinInput from "@ui-machines/pin-input"
import { normalizeProps, useMachine, VuePropTypes } from "@ui-machines/vue"
import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment } from "vue"
import { pinInputStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"

injectGlobal(pinInputStyle)

export default defineComponent({
  name: "PinInput",
  setup() {
    const [state, send] = useMachine(
      PinInput.machine.withContext({
        autoFocus: true,
        onComplete(val) {
          console.log(val)
        },
      }),
    )

    const ref = useMount(send)

    const pinInputRef = computed(() => PinInput.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      const { containerProps, getInputProps, clearValue } = pinInputRef.value
      return (
        <div>
          <div class="pin-input" style={{ width: "300px" }} ref={ref} {...containerProps}>
            <input data-testid="input-1" {...getInputProps({ index: 0 })} />
            <input data-testid="input-2" {...getInputProps({ index: 1 })} />
            <input data-testid="input-3" {...getInputProps({ index: 2 })} />
          </div>

          <button data-testid="clear-button" onClick={clearValue}>
            Clear
          </button>

          <StateVisualizer state={state.value} />
        </div>
      )
    }
  },
})
