import { injectGlobal } from "@emotion/css"
import * as Slider from "@ui-machines/slider"
import { normalizeProps, useMachine, useSetup, VuePropTypes } from "@ui-machines/vue"
import { defineComponent } from "@vue/runtime-core"
import serialize from "form-serialize"
import { useControls } from "../hooks/use-controls"
import { computed, h, Fragment } from "vue"
import { sliderStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

injectGlobal(sliderStyle)

export default defineComponent({
  name: "Slider",
  setup() {
    const controls = useControls({
      disabled: { type: "boolean", defaultValue: false },
      value: { type: "number", defaultValue: 40 },
      dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
      origin: { type: "select", options: ["center", "start"] as const, defaultValue: "start" },
    })

    const [state, send] = useMachine(Slider.machine, {
      context: controls.context,
    })

    const ref = useSetup({ send, id: "1" })

    const sliderRef = computed(() => Slider.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      const { rootProps, rangeProps, trackProps, inputProps, thumbProps, labelProps, outputProps, value } =
        sliderRef.value

      return (
        <>
          <controls.ui />
          <form
            // ensure we can read the value within forms
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
        </>
      )
    }
  },
})
