import { injectGlobal } from "@emotion/css"
import * as RangeSlider from "@ui-machines/range-slider"
import { normalizeProps, useMachine, useSetup, VuePropTypes } from "@ui-machines/vue"
import { defineComponent } from "@vue/runtime-core"
import serialize from "form-serialize"
import { computed, h, Fragment } from "vue"
import { rangeSliderStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

injectGlobal(rangeSliderStyle)

export default defineComponent({
  name: "RangeSlider",
  setup() {
    const [state, send] = useMachine(
      RangeSlider.machine.withContext({
        dir: "ltr",
        name: ["min", "max"],
        uid: "123",
        value: [10, 60],
      }),
    )

    const ref = useSetup({ send, id: "1" })

    const sliderRef = computed(() => RangeSlider.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      const { rootProps, rangeProps, trackProps, getInputProps, getThumbProps, values } = sliderRef.value

      return (
        <div>
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

            <StateVisualizer state={state.value} />
          </form>
        </div>
      )
    }
  },
})
