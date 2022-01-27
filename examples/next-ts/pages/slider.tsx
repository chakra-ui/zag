import { Global } from "@emotion/react"
import { useMachine, useSetup } from "@ui-machines/react"
import * as Slider from "@ui-machines/slider"
import serialize from "form-serialize"
import { sliderControls } from "../../../shared/controls"
import { sliderStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(sliderControls)

  const [state, send] = useMachine(Slider.machine, {
    context: controls.context,
  })

  const ref = useSetup<HTMLDivElement>({ send, id: "1" })

  const { inputProps, thumbProps, rootProps, trackProps, rangeProps, labelProps, outputProps, value } = Slider.connect(
    state,
    send,
  )

  return (
    <>
      <Global styles={sliderStyle} />
      <controls.ui />

      <form
        // ensure we can read the value within forms
        onChange={(e) => {
          const formData = serialize(e.currentTarget, { hash: true })
          console.log(formData)
        }}
      >
        <div className="root">
          <label data-testid="label" {...labelProps}>
            Slider Label
          </label>
          <output data-testid="output" {...outputProps}>
            {value}
          </output>
        </div>
        <div className="slider" ref={ref} {...rootProps}>
          <div data-testid="track" className="slider__track" {...trackProps}>
            <div className="slider__range" {...rangeProps} />
          </div>
          <div data-testid="thumb" className="slider__thumb" {...thumbProps}>
            <input {...inputProps} />
          </div>
        </div>

        <StateVisualizer state={state} />
      </form>
    </>
  )
}
