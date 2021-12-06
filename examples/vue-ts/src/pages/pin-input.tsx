import { pinInput } from "@ui-machines/pin-input"
import { useMachine, normalizeProps, VuePropTypes } from "@ui-machines/vue"

import { computed, h, Fragment } from "vue"
import { defineComponent } from "@vue/runtime-core"

import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"

export default defineComponent({
  name: "PinInput",
  setup() {
    const [state, send] = useMachine(
      pinInput.machine.withContext({
        autoFocus: true,
        onComplete(val) {
          console.log(val)
        },
      }),
    )

    const ref = useMount(send)

    const machineState = computed(() => pinInput.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      return (
        <div>
          <div style={{ width: "300px" }} ref={ref} {...machineState.value.containerProps}>
            <input {...machineState.value.getInputProps({ index: 0 })} />
            <input {...machineState.value.getInputProps({ index: 1 })} />
            <input {...machineState.value.getInputProps({ index: 2 })} />
          </div>

          <StateVisualizer state={state.value} />
        </div>
      )
    }
  },
})
