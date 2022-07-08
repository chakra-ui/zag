import { injectGlobal } from "@emotion/css"
import * as slider from "@zag-js/range-slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { defineComponent } from "@vue/runtime-core"
import serialize from "form-serialize"
import { computed, h, Fragment } from "vue"
import { rangeSliderControls, sliderStyle } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

import { Toolbar } from "../components/toolbar"

injectGlobal(sliderStyle)

export default defineComponent({
  name: "RangeSlider",
  setup() {
    const controls = useControls(rangeSliderControls)

    const [state, send] = useMachine(
      slider.machine({
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
          <main>
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
                  <output {...api.outputProps}>{api.values.join(" - ")}</output>
                </div>
                <div class="control-area">
                  <div {...api.controlProps}>
                    <div {...api.trackProps}>
                      <div {...api.rangeProps} />
                    </div>
                    {api.values.map((_, index) => (
                      <div key={index} {...api.getThumbProps(index)}>
                        <input {...api.getInputProps(index)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          </main>

          <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
        </>
      )
    }
  },
})
