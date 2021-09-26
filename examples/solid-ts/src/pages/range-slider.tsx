import { rangeSlider } from "@ui-machines/web"
import { normalizeProps, useMachine, useSetup } from "@ui-machines/solid"

import { createMemo } from "solid-js"
import { css } from "@emotion/css"
import serialize from "form-serialize"

import { StateVisualizer } from "../components/state-visualizer"
import { rangeSliderStyle } from "../../../../shared/style"

const styles = css(rangeSliderStyle)

export default function Page() {
  const [state, send] = useMachine(
    rangeSlider.machine.withContext({
      dir: "ltr",
      name: ["min", "max"],
      uid: "solid-range-slider",
      value: [10, 60],
    }),
  )

  const ref = useSetup<HTMLDivElement>({ send, id: "range-slider" })

  const machineState = createMemo(() => rangeSlider.connect(state, send, normalizeProps))

  return (
    <div className={styles}>
      <form
        // ensure we can read the value within forms
        onChange={(e) => {
          const formData = serialize(e.currentTarget, { hash: true })
          console.log(formData)
        }}
      >
        <div className="slider" ref={ref} {...machineState().rootProps}>
          <div className="slider__track" {...machineState().trackProps}>
            <div className="slider__range" {...machineState().rangeProps} />
          </div>
          {machineState().values.map((_val, index) => (
            <div key={index} className="slider__thumb" {...machineState().getThumbProps(index)}>
              <input {...machineState().getInputProps(index)} />
            </div>
          ))}
        </div>

        <StateVisualizer state={state} />
      </form>
    </div>
  )
}
