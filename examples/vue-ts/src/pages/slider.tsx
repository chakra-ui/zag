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
        value: [0],
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
              <div {...api.getRootProps()}>
                <div>
                  <label data-testid="label" {...api.getLabelProps()}>
                    Slider Label
                  </label>
                  <output data-testid="output" {...api.getValueTextProps()}>
                    {api.value}
                  </output>
                </div>
                <div class="control-area">
                  <div {...api.getControlProps()}>
                    <div data-testid="track" {...api.getTrackProps()}>
                      <div {...api.getRangeProps()} />
                    </div>
                    {api.value.map((_, index) => (
                      <div key={index} {...api.getThumbProps({ index })}>
                        <input {...api.getHiddenInputProps({ index })} />
                      </div>
                    ))}
                  </div>
                  <div {...api.getMarkerGroupProps()}>
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
