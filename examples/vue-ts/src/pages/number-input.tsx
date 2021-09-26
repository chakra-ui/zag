import { defineComponent } from "@vue/runtime-core"
import { computed, nextTick, onMounted, ref, h, Fragment, watch } from "vue"
import { useMachine, normalizeProps } from "@ui-machines/vue"
import { numberInput } from "@ui-machines/web"
import { StateVisualizer } from "../components/state-visualizer"

export default defineComponent({
  name: "NumberInput",
  setup() {
    const [state, send] = useMachine(
      numberInput.machine.withContext({
        min: 0,
        max: 10,
        clampValueOnBlur: true,
      }),
    )

    const input = ref()
    const machineState = computed(() => numberInput.connect(state.value, send, normalizeProps))

    onMounted(async () => {
      await nextTick()
      send({
        type: "SETUP",
        doc: input.value?.ownerDocument,
        id: "number-input-1",
      })
    })

    return () => {
      const { decrementButtonProps, incrementButtonProps, inputProps } = machineState.value
      return (
        <>
          <h3>
            Vue NumberInput with <code>useMachine</code>
          </h3>
          <div>
            <button {...decrementButtonProps}>DEC</button>
            {/* @ts-ignore */}
            <input ref={input} {...inputProps} />
            <button {...incrementButtonProps}>INC</button>

            <StateVisualizer state={state.value} />
          </div>
        </>
      )
    }
  },
})
