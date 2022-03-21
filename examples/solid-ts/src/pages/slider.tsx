import { injectGlobal } from "@emotion/css"
import * as Slider from "@ui-machines/slider"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@ui-machines/solid"
import serialize from "form-serialize"
import { createMemo, createUniqueId } from "solid-js"
import { sliderControls } from "../../../../shared/controls"
import { sliderStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(sliderStyle)

export default function Page() {
  const controls = useControls(sliderControls)

  const [state, send] = useMachine(Slider.machine, {
    context: controls.context,
  })

  const ref = useSetup<HTMLDivElement>({ send, id: createUniqueId() })

  const slider = createMemo(() => Slider.connect<PropTypes>(state, send, normalizeProps))

  return (
    <>
      <controls.ui />
      <form
        // ensure we can read the value within forms
        onInput={(e) => {
          const formData = serialize(e.currentTarget, { hash: true })
          console.log(formData)
        }}
      >
        <div>
          <label {...slider().labelProps}>Slider Label</label>
          <output {...slider().outputProps}>{slider().value}</output>
        </div>
        <div className="slider" ref={ref} {...slider().rootProps}>
          <div className="slider__track" {...slider().trackProps}>
            <div className="slider__range" {...slider().rangeProps} />
          </div>
          <div className="slider__thumb" {...slider().thumbProps}>
            <input {...slider().inputProps} />
          </div>
        </div>

        <StateVisualizer state={state} />
      </form>
    </>
  )
}
