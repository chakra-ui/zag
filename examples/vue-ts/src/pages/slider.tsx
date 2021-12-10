import { css } from "@emotion/css"
import * as Slider from "@ui-machines/slider"
import { normalizeProps, useMachine, VuePropTypes } from "@ui-machines/vue"
import { defineComponent } from "@vue/runtime-core"
import serialize from "form-serialize"
import { computed, h, Fragment } from "vue"
import { sliderStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"

const styles = css(sliderStyle)

export default defineComponent({
  name: "Slider",
  setup() {
    const [state, send] = useMachine(
      Slider.machine.withContext({
        uid: "123",
        value: 40,
        name: "volume",
        dir: "ltr",
      }),
    )

    const ref = useMount(send)

    const sliderRef = computed(() => Slider.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      const { rootProps, rangeProps, trackProps, inputProps, thumbProps, labelProps, outputProps, value } =
        sliderRef.value

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
