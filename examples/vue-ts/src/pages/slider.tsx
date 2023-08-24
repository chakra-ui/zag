import { sliderControls } from "@zag-js/shared"
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import serialize from "form-serialize"
import { computed, defineComponent } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

import { Toolbar } from "../components/toolbar"

export default defineComponent({
  name: "Slider",
  setup() {
    const controls = useControls(sliderControls)

    const [state, send] = useMachine(
      slider.machine({
        id: "1",
        name: "quantity",
      }),
      {
        context: controls.context,
      },
    )

    const apiRef = computed(() => slider.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="slider">
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
              <div {...api.rootProps}>
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
                      <input {...api.hiddenInputProps} />
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
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})
