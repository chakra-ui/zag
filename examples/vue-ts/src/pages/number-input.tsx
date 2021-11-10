import { mergeProps, numberInput } from "@ui-machines/web"
import { useMachine, normalizeProps, VuePropTypes } from "@ui-machines/vue"

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

    const inputRef = ref<HTMLInputElement>()

    const machineState = computed(() => numberInput.connect<VuePropTypes>(state.value, send, normalizeProps))

    onMounted(async () => {
      await nextTick()
      send({
        type: "SETUP",
        doc: inputRef.value?.ownerDocument,
        id: "number-input",
      })
    })

    return () => {
      const { decrementButtonProps, incrementButtonProps, inputProps, scrubberProps, labelProps } = machineState.value

      return (
        <>
          <div>
            <label {...labelProps}>Enter number</label>
            <div>
              <div {...mergeProps(scrubberProps, { style: { width: "15px", height: "15px", background: "red" } })} />
              <button {...decrementButtonProps}>DEC</button>
              <input ref={inputRef} {...inputProps} />
              <button {...incrementButtonProps}>INC</button>
            </div>
            <StateVisualizer state={state.value} />
          </div>
        </>
      )
    }
  },
})
