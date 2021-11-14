/* eslint-disable jsx-a11y/label-has-associated-control */
import * as styled from "@emotion/styled"
import { useMachine } from "@ui-machines/react"
import { slider } from "@ui-machines/web"
import { StateVisualizer } from "components/state-visualizer"
import serialize from "form-serialize"
import { useMount } from "hooks/use-mount"
import { sliderStyle } from "../../../shared/style"

const Styles = styled.default("div")(sliderStyle)

export default function Page() {
  const [state, send] = useMachine(
    slider.machine.withContext({
      uid: "123",
      value: 40,
      name: "volume",
    }),
  )

  const ref = useMount<HTMLDivElement>(send)

  const { inputProps, thumbProps, rootProps, trackProps, rangeProps, labelProps, outputProps, value } = slider.connect(
    state,
    send,
  )

  return (
    <Styles>
      <form // ensure we can read the value within forms
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
    </Styles>
  )
}
