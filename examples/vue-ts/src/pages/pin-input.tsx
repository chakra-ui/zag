import * as PinInput from "@ui-machines/pin-input"
import { normalizeProps, useMachine, VuePropTypes } from "@ui-machines/vue"
import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"

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
      const { containerProps, getInputProps } = pinInputRef.value
      return (
        <div>
          <div style={{ width: "300px" }} ref={ref} {...containerProps}>
            <input {...getInputProps({ index: 0 })} />
            <input {...getInputProps({ index: 1 })} />
            <input {...getInputProps({ index: 2 })} />
          </div>

          <StateVisualizer state={state.value} />
        </div>
      )
    }
  },
})
