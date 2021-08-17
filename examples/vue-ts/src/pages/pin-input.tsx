import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment, watch } from "vue"
import { useMachine, normalizeProps } from "@ui-machines/vue"
import { pinInput } from "@ui-machines/web"
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

    const _ref = useMount(send)
    const machineState = computed(() => pinInput.connect(state.value, send, normalizeProps))

    return () => {
      return (
        <div>
          <div style={{ width: "300px" }} ref={_ref}>
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
