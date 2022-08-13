import * as slider from "@zag-js/range-slider"
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
      values: [10, 60],
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
              <output {...api.outputProps}>{api.values.join(" - ")}</output>
            </div>
            <div className="control-area">
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
        <button
          onClick={() => {
            api.setValue([10, 30, 60])
          }}
        >
          Set
        </button>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
