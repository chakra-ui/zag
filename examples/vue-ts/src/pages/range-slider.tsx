import { rangeSlider } from "@ui-machines/range-slider"
import { useMachine, normalizeProps, VuePropTypes } from "@ui-machines/vue"

import { computed, h, Fragment } from "vue"
import { defineComponent } from "@vue/runtime-core"
import serialize from "form-serialize"
import { css, CSSObject } from "@emotion/css"

import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"
import { rangeSliderStyle } from "../../../../shared/style"

const styles = css(rangeSliderStyle as CSSObject)

export default defineComponent({
  name: "RangeSlider",
  setup() {
    const [state, send] = useMachine(
      rangeSlider.machine.withContext({
        dir: "ltr",
        name: ["min", "max"],
        uid: "123",
        value: [10, 60],
      }),
    )

    const ref = useMount(send)

    const machineState = computed(() => rangeSlider.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      const { rootProps, rangeProps, trackProps, getInputProps, getThumbProps, values } = machineState.value

      return (
        <div class={styles}>
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
