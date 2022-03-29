import { injectGlobal } from "@emotion/css"
import * as Slider from "@ui-machines/slider"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@ui-machines/vue"
import { defineComponent } from "@vue/runtime-core"
import serialize from "form-serialize"
import { useControls } from "../hooks/use-controls"
import { computed, h, Fragment } from "vue"
import { sliderControls } from "../../../../shared/controls"
import { sliderStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

injectGlobal(sliderStyle)

export default defineComponent({
  name: "Slider",
  setup() {
    const controls = useControls(sliderControls)

    const [state, send] = useMachine(
      Slider.machine.withContext({
        name: "quantity",
      }),
      {
        context: controls.context,
      },
    )

    const ref = useSetup({ send, id: "1" })

    const apiRef = computed(() => Slider.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <controls.ui />
          <form
            // ensure we can read the value within forms
            onInput={(e) => {
              const target = e.currentTarget
              if (target instanceof HTMLFormElement) {
                const formData = serialize(target, { hash: true })
                console.log(formData)
              }
            }}
          >
            <div class="slider" ref={ref} {...api.rootProps}>
              <div>
                <label data-testid="label" {...api.labelProps}>
                  Slider Label
                </label>
                <output data-testid="output" {...api.outputProps}>
                  {api.value}
                </output>
              </div>

              <div class="control-area">
                <div {...api.controlProps}>
                  <div data-testid="track" {...api.trackProps}>
                    <div {...api.rangeProps} />
                  </div>
                  <div data-testid="thumb" {...api.thumbProps}>
                    <input {...api.inputProps} />
                  </div>
                </div>

                <div {...api.markerGroupProps}>
                  <span {...api.getMarkerProps({ value: 10 })}>*</span>
                  <span {...api.getMarkerProps({ value: 30 })}>*</span>
                  <span {...api.getMarkerProps({ value: 90 })}>*</span>
                </div>
              </div>
            </div>
          </form>

          <StateVisualizer state={state} />
        </>
      )
    }
  },
})
