import { rangeSlider } from "@ui-machines/web"
import { useMachine, normalizeProps } from "@ui-machines/vue"

import { computed, h, Fragment } from "vue"
import { defineComponent } from "@vue/runtime-core"
import serialize from "form-serialize"
import { css } from "@emotion/css"

import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"
import { rangeSliderStyle } from "../../../../shared/style"

const styles = css(rangeSliderStyle)

export default defineComponent({
  name: "RangeSlider",
  setup() {
    const [state, send] = useMachine(
      rangeSlider.machine.withContext({
        dir: "ltr",
        name: ["min", "max"],
        uid: "uid",
        value: [10, 60],
      }),
    )

    const ref = useMount(send)

    const machineState = computed(() => rangeSlider.connect(state.value, send, normalizeProps))

    return () => {
      const { rootProps, rangeProps, trackProps, getInputProps, getThumbProps, values } = machineState.value

      return (
        <div className={styles}>
          <form
            // ensure we can read the value within forms
            onChange={(e) => {
              const formData = serialize(e.currentTarget, { hash: true })
              console.log(formData)
            }}
          >
            <div className="slider" ref={ref} {...rootProps}>
              <div className="slider__track" {...trackProps}>
                <div className="slider__range" {...rangeProps} />
              </div>
              {values.map((_, index) => (
                <div key={index} className="slider__thumb" {...getThumbProps(index)}>
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
