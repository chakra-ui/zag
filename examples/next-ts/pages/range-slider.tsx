import styled from "@emotion/styled"
import * as RangeSlider from "@ui-machines/range-slider"
import { useMachine, useSetup } from "@ui-machines/react"
import { StateVisualizer } from "components/state-visualizer"
import serialize from "form-serialize"
import { rangeSliderStyle } from "../../../shared/style"

const Styles = styled.div(rangeSliderStyle)

export default function Page() {
  const [state, send] = useMachine(
    RangeSlider.machine.withContext({
      dir: "ltr",
      name: ["min", "max"],
      uid: "123",
      value: [0, 0, 60],
      onChangeStart() {
        console.log("onChangeStart")
      },
      onChange() {
        console.log("onChange")
      },
      onChangeEnd() {
        console.log("onChangeEnd")
      },
    }),
  )

  const ref = useSetup<HTMLDivElement>({ send, id: "1" })

  const { getThumbProps, rootProps, rangeProps, trackProps, getInputProps, values } = RangeSlider.connect(state, send)

  return (
    <Styles>
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
    </Styles>
  )
}
