import { rangeSlider } from "@ui-machines/web"
import { useMachine } from "@ui-machines/react"

import serialize from "form-serialize"
import * as styled from "@emotion/styled"

import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import { rangeSliderStyle } from "../../../shared/style"

const Styles = styled.default(`div`)(rangeSliderStyle as styled.CSSObject)

export default function Page() {
  const [state, send] = useMachine(
    rangeSlider.machine.withContext({
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

  const ref = useMount<HTMLDivElement>(send)

  const { getThumbProps, rootProps, rangeProps, trackProps, getInputProps, values } = rangeSlider.connect(state, send)

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
