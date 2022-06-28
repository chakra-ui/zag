import { injectGlobal } from "@emotion/css"
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine, useSetup } from "@zag-js/solid"
import serialize from "form-serialize"
import { createMemo, createUniqueId } from "solid-js"
import { sliderControls, sliderStyle } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

injectGlobal(sliderStyle)

export default function Page() {
  const controls = useControls(sliderControls)

  const [state, send] = useMachine(slider.machine, {
    context: controls.context,
  })

  const ref = useSetup({ send, id: createUniqueId() })

  const api = createMemo(() => slider.connect(state, send, normalizeProps))

  return (
    <>
      <main>
        <form
          // ensure we can read the value within forms
          onInput={(e) => {
            const formData = serialize(e.currentTarget, { hash: true })
            console.log(formData)
          }}
        >
          <div ref={ref} {...api().rootProps}>
            <div>
              <label data-testid="label" {...api().labelProps}>
                Slider Label
              </label>
              <output data-testid="output" {...api().outputProps}>
                {api().value}
              </output>
            </div>
            <div className="control-area">
              <div {...api().controlProps}>
                <div data-testid="track" {...api().trackProps}>
                  <div {...api().rangeProps} />
                </div>
                <div data-testid="thumb" {...api().thumbProps}>
                  <input {...api().inputProps} />
                </div>
              </div>
              <div {...api().markerGroupProps}>
                <span {...api().getMarkerProps({ value: 10 })}>*</span>
                <span {...api().getMarkerProps({ value: 30 })}>*</span>
                <span {...api().getMarkerProps({ value: 90 })}>*</span>
              </div>
            </div>
          </div>
        </form>
      </main>
      <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
    </>
  )
}
