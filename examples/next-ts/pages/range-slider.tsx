import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/react"
import { sliderControls } from "@zag-js/shared"
import serialize from "form-serialize"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(sliderControls)

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
          <div {...api.getRootProps()}>
            <div>
              <label {...api.getLabelProps()}>Quantity:</label>
              <output {...api.getValueTextProps()}>{api.value.join(" - ")}</output>
            </div>
            <div className="control-area">
              <div {...api.getControlProps()}>
                <div {...api.getTrackProps()}>
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
