import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/react"
import { rangeSliderControls } from "@zag-js/shared"
import serialize from "form-serialize"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(rangeSliderControls)

  const [state, send] = useMachine(
    slider.machine({
      id: useId(),
      name: "quantity",
      value: [10, 60],
    }),
    { context: controls.context },
  )

  const api = slider.connect(state, send, normalizeProps)

  return (
    <>
      <main className="slider">
        <form
          // ensure we can read the value within forms
          onChange={(e) => {
            const formData = serialize(e.currentTarget, { hash: true })
            console.log(formData)
          }}
        >
          <div {...api.rootProps}>
            <div>
              <label {...api.labelProps}>Quantity:</label>
              <output {...api.outputProps}>{api.value.join(" - ")}</output>
            </div>
            <div className="control-area">
              <div {...api.controlProps}>
                <div {...api.trackProps}>
                  <div {...api.rangeProps} />
                </div>
                {api.value.map((_, index) => (
                  <div key={index} {...api.getThumbProps({ index })}>
                    <input {...api.getHiddenInputProps({ index })} />
                  </div>
                ))}
              </div>
              <div {...api.markerGroupProps}>
                <span {...api.getMarkerProps({ value: 10 })}>*</span>
                <span {...api.getMarkerProps({ value: 30 })}>*</span>
                <span {...api.getMarkerProps({ value: 50 })}>*</span>
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
