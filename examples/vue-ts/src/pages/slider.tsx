import { slider } from "@ui-machines/web"
import { useMachine, normalizeProps } from "@ui-machines/vue"

import { computed, h, Fragment } from "vue"
import { defineComponent } from "@vue/runtime-core"
import { css } from "@emotion/css"
import serialize from "form-serialize"

import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"
import { sliderStyle } from "../../../../shared/style"

const styles = css(sliderStyle)

export default defineComponent({
  name: "Slider",
  setup() {
    const [state, send] = useMachine(
      slider.machine.withContext({
        uid: "uid",
        value: 40,
        name: "volume",
        dir: "ltr",
      }),
    )

    const ref = useMount(send)

    const connect = computed(() => slider.connect(state.value, send, normalizeProps))

    return () => {
      const { rootProps, rangeProps, trackProps, inputProps, thumbProps, labelProps, outputProps, value } =
        connect.value

      return (
        <div className={styles}>
          <form // ensure we can read the value within forms
            onChange={(e) => {
              const formData = serialize(e.currentTarget, { hash: true })
              console.log(formData)
            }}
          >
            <div>
              <label {...labelProps}>Slider Label</label>
              <output {...outputProps}>{value}</output>
            </div>
            <div className="slider" ref={ref} {...rootProps}>
              <div className="slider__track" {...trackProps}>
                <div className="slider__range" {...rangeProps} />
              </div>
              <div className="slider__thumb" {...thumbProps}>
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
