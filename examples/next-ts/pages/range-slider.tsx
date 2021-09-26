import { rangeSlider } from "@ui-machines/web"
import { useMachine } from "@ui-machines/react"

import serialize from "form-serialize"
import styled from "@emotion/styled"

import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import { rangeSliderStyle } from "../../../shared/style"

const Styles = styled(`div`)(rangeSliderStyle)

export default function Page() {
  const [state, send] = useMachine(
    rangeSlider.machine.withContext({
      dir: "ltr",
      name: ["min", "max"],
      uid: "next-range-slider",
      value: [10, 60],
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
