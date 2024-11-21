import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, Index } from "solid-js"
import { angleSliderControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(angleSliderControls)

  const [state, send] = useMachine(angleSlider.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => angleSlider.connect(state, send, normalizeProps))

  return (
    <>
      <main class="angle-slider">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>
            Angle Slider: <div {...api().getValueTextProps()}>{api().valueAsDegree}</div>
          </label>
          <div {...api().getControlProps()}>
            <div {...api().getThumbProps()}></div>
            <div {...api().getMarkerGroupProps()}>
              <Index each={[0, 45, 90, 135, 180, 225, 270, 315]}>
                {(value) => <div {...api().getMarkerProps({ value: value() })}></div>}
              </Index>
            </div>
          </div>
          <input {...api().getHiddenInputProps()} />
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
