import { normalizeProps, useMachine } from "@zag-js/react"
import { sliderControls } from "@zag-js/shared"
import * as slider from "@zag-js/slider"
import serialize from "form-serialize"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(sliderControls)

  const service = useMachine(slider.machine, {
    id: useId(),
    name: "quantity",
    defaultValue: [0],
    ...controls.context,
    thumbSize: { width: 20, height: 20 },
  })

  const api = slider.connect(service, normalizeProps)

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
              <label data-testid="label" {...api.getLabelProps()}>
                Slider Label
              </label>
              <output data-testid="output" {...api.getValueTextProps()}>
                {api.value}
              </output>
            </div>
            <div className="control-area">
              <div {...api.getControlProps()}>
                <div data-testid="track" {...api.getTrackProps()}>
                  <div {...api.getRangeProps()} />
                </div>
                <span {...api.getDraggingIndicatorProps({ index: 0 })}>{api.getThumbValue(0)}</span>
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
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
