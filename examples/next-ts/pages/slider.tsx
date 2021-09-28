/* eslint-disable jsx-a11y/label-has-associated-control */
import { slider } from "@ui-machines/web"
import { useMachine } from "@ui-machines/react"

import serialize from "form-serialize"
import styled from "@emotion/styled"

import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import { sliderStyle } from "../../../shared/style"

const Styles = styled(`div`)(sliderStyle)

export default function Page() {
  const [state, send] = useMachine(
    slider.machine.withContext({
      uid: "123",
      value: 40,
      name: "volume",
      dir: "ltr",
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
        <div>
          <label {...labelProps}>Slider Label</label>
          <output {...outputProps}>{value}</output>
        </div>
        <div className="slider" ref={ref} {...rootProps}>
          <div className="slider__track" {...trackProps}>
            <div className="slider__range" {...rangeProps} />
          </div>
          <div className="slider__thumb" {...thumbProps}>
            <input {...inputProps} />
          </div>
        </div>

        <StateVisualizer state={state} />
      </form>
    </Styles>
  )
}
