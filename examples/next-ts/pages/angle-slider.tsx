import * as angleSlider from "@zag-js/angle-slider"
import { useMachine, normalizeProps } from "@zag-js/react"
import { angleSliderControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(angleSliderControls)

  const [state, send] = useMachine(angleSlider.machine({ id: useId() }), {
    context: controls.context,
  })

  const api = angleSlider.connect(state, send, normalizeProps)

  return (
    <>
      <main className="angle-slider">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>
            Angle Slider: <div {...api.getValueTextProps()}>{api.valueAsDegree}</div>
          </label>
          <div {...api.getControlProps()}>
            <div {...api.getThumbProps()}></div>
            <div {...api.getMarkerGroupProps()}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((value) => (
                <div key={value} {...api.getMarkerProps({ value })}></div>
              ))}
            </div>
          </div>
          <input {...api.getHiddenInputProps()} />
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
