import { numberInput } from "@ui-machines/web"
import { useMachine, normalizeProps } from "@ui-machines/vue"

import { computed, nextTick, onMounted, ref, h, Fragment } from "vue"
import { defineComponent } from "@vue/runtime-core"

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

    const inputRef = ref()

    const machineState = computed(() => numberInput.connect(state.value, send, normalizeProps))

    onMounted(async () => {
      await nextTick()
      send({
        type: "SETUP",
        doc: inputRef.value?.ownerDocument,
        id: "number-input",
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
            <input ref={inputRef} {...inputProps} />
            <button {...incrementButtonProps}>INC</button>

            <StateVisualizer state={state.value} />
          </div>
        </>
      )
    }
  },
})
