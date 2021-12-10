import { mergeProps } from "@ui-machines/core"
import * as NumberInput from "@ui-machines/number-input"
import { normalizeProps, useMachine, VuePropTypes } from "@ui-machines/vue"
import { defineComponent } from "@vue/runtime-core"
import { computed, h, nextTick, onMounted, ref, Fragment } from "vue"
import { StateVisualizer } from "../components/state-visualizer"

export default defineComponent({
  name: "NumberInput",
  setup() {
    const [state, send] = useMachine(
      NumberInput.machine.withContext({
        min: 0,
        max: 10,
        clampValueOnBlur: true,
      }),
    )

    const inputRef = ref<HTMLInputElement>()

    const numberInputRef = computed(() => NumberInput.connect<VuePropTypes>(state.value, send, normalizeProps))

    onMounted(async () => {
      await nextTick()
      send({
        type: "SETUP",
        doc: inputRef.value?.ownerDocument,
        id: "number-input",
      })
    })

    return () => {
      const { decrementButtonProps, incrementButtonProps, inputProps, scrubberProps, labelProps } = numberInputRef.value

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
