import { Global } from "@emotion/react"
import { useMachine, useSetup } from "@zag-js/react"
import { sliderControls, sliderStyle } from "@zag-js/shared"
import * as slider from "@zag-js/slider"
import serialize from "form-serialize"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(sliderControls)

  const [state, send] = useMachine(
    slider.machine({
      name: "quantity",
    }),
    {
      context: controls.context,
    },
  )

  const ref = useSetup({ send, id: useId() })

  const api = slider.connect(state, send)

  return (
    <>
      <Global styles={sliderStyle} />

      <main>
        <form
          // ensure we can read the value within forms
          onChange={(e) => {
            const formData = serialize(e.currentTarget, { hash: true })
            console.log(formData)
          }}
        >
          <div ref={ref} {...api.rootProps}>
            <div>
              <label data-testid="label" {...api.labelProps}>
                Slider Label
              </label>
              <output data-testid="output" {...api.outputProps}>
                {api.value}
              </output>
            </div>
            <div className="control-area">
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
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
