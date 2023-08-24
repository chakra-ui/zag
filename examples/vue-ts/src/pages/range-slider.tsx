import * as slider from "@zag-js/range-slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import serialize from "form-serialize"
import { computed, defineComponent, h, Fragment } from "vue"
import { rangeSliderControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

import { Toolbar } from "../components/toolbar"

export default defineComponent({
  name: "RangeSlider",
  setup() {
    const controls = useControls(rangeSliderControls)

    const [state, send] = useMachine(
      slider.machine({
        id: "1",
        name: "quantity",
        value: [10, 60],
      }),
      { context: controls.context },
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
                const formData = serialize(e.currentTarget as HTMLFormElement, { hash: true })
                console.log(formData)
              }}
            >
              <div {...api.rootProps}>
                <div>
                  <label {...api.labelProps}>Quantity:</label>
                  <output {...api.outputProps}>{api.value.join(" - ")}</output>
                </div>
                <div class="control-area">
                  <div {...api.controlProps}>
                    <div {...api.trackProps}>
                      <div {...api.rangeProps} />
                    </div>
                    {api.value.map((_, index) => (
                      <div key={index} {...api.getThumbProps(index)}>
                        <input {...api.getHiddenInputProps(index)} />
                      </div>
                    ))}
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
