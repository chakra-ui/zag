import { Global } from "@emotion/react"
import * as RangeSlider from "@ui-machines/range-slider"
import { useMachine, useSetup } from "@ui-machines/react"
import { StateVisualizer } from "../components/state-visualizer"
import serialize from "form-serialize"
import { rangeSliderStyle } from "../../../shared/style"
import { useControls } from "../hooks/use-controls"
import { rangeSliderControls } from "../../../shared/controls"

export default function Page() {
  const controls = useControls(rangeSliderControls)

  const [state, send] = useMachine(
    RangeSlider.machine.withContext({
      name: ["min", "max"],
      value: [10, 60],
    }),
    { context: controls.context },
  )

  const ref = useSetup<HTMLDivElement>({ send, id: "1" })

  const { getThumbProps, rootProps, rangeProps, trackProps, getInputProps, values } = RangeSlider.connect(state, send)

  return (
    <>
      <Global styles={rangeSliderStyle} />
      <controls.ui />

      <form
        // ensure we can read the value within forms
        onChange={(e) => {
          const formData = serialize(e.currentTarget, { hash: true })
          console.log(formData)
        }}
      >
        <div className="slider" ref={ref} {...rootProps}>
          <div className="slider__track" {...trackProps}>
            <div className="slider__range" {...rangeProps} />
          </div>
          {values.map((_, index) => (
            <div key={index} className="slider__thumb" {...getThumbProps(index)}>
              <input {...getInputProps(index)} />
            </div>
          ))}
        </div>

        <StateVisualizer state={state} />
      </form>
    </>
  )
}
