import { slider } from "@ui-machines/slider"
import { useMachine, normalizeProps, VuePropTypes } from "@ui-machines/vue"

import { computed, h, Fragment } from "vue"
import { defineComponent } from "@vue/runtime-core"
import { css, CSSObject } from "@emotion/css"
import serialize from "form-serialize"

import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"
import { sliderStyle } from "../../../../shared/style"

const styles = css(sliderStyle as CSSObject)

export default defineComponent({
  name: "Slider",
  setup() {
    const [state, send] = useMachine(
      slider.machine.withContext({
        uid: "123",
        value: 40,
        name: "volume",
        dir: "ltr",
      }),
    )

    const ref = useMount(send)

    const machineState = computed(() => slider.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      const { rootProps, rangeProps, trackProps, inputProps, thumbProps, labelProps, outputProps, value } =
        machineState.value

      return (
        <div class={styles}>
          <form // ensure we can read the value within forms
            onChange={(e) => {
              const target = e.currentTarget as HTMLFormElement
              const formData = serialize(target, { hash: true })
              console.log(formData)
            }}
          >
            <div>
              <label {...labelProps}>Slider Label</label>
              <output {...outputProps}>{value}</output>
            </div>
            <div class="slider" ref={ref} {...rootProps}>
              <div class="slider__track" {...trackProps}>
                <div class="slider__range" {...rangeProps} />
              </div>
              <div class="slider__thumb" {...thumbProps}>
                <input {...inputProps} />
              </div>
            </div>

            <StateVisualizer state={state.value} />
          </form>
        </div>
      )
    }
  },
})
