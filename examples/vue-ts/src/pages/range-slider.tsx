import { injectGlobal } from "@emotion/css"
import * as RangeSlider from "@ui-machines/range-slider"
import { normalizeProps, useMachine, useSetup, VuePropTypes } from "@ui-machines/vue"
import { defineComponent } from "@vue/runtime-core"
import serialize from "form-serialize"
import { computed, h, Fragment } from "vue"
import { rangeSliderControls } from "../../../../shared/controls"
import { rangeSliderStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(rangeSliderStyle)

export default defineComponent({
  name: "RangeSlider",
  setup() {
    const controls = useControls(rangeSliderControls)

    const [state, send] = useMachine(
      RangeSlider.machine.withContext({
        name: ["min", "max"],
        value: [10, 60],
      }),
      { context: controls.context },
    )

    const ref = useSetup({ send, id: "1" })

    const slider = computed(() => RangeSlider.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      const { rootProps, rangeProps, trackProps, getInputProps, getThumbProps, values } = slider.value

      return (
        <>
          <controls.ui />

          <form
            // ensure we can read the value within forms
            onChange={(e) => {
              const formData = serialize(e.currentTarget as HTMLFormElement, { hash: true })
              console.log(formData)
            }}
          >
            <div class="slider" ref={ref} {...rootProps}>
              <div class="slider__track" {...trackProps}>
                <div class="slider__range" {...rangeProps} />
              </div>
              {values.map((_, index) => (
                <div key={index} class="slider__thumb" {...getThumbProps(index)}>
                  <input name="min" {...getInputProps(index)} />
                </div>
              ))}
            </div>

            <StateVisualizer state={state} />
          </form>
        </>
      )
    }
  },
})
