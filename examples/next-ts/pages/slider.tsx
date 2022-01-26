import { Global } from "@emotion/react"
import { useMachine, useSetup } from "@ui-machines/react"
import * as Slider from "@ui-machines/slider"
import { StateVisualizer } from "components/state-visualizer"
import serialize from "form-serialize"
import { useControls } from "../hooks/use-controls"
import { sliderStyle } from "../../../shared/style"

export default function Page() {
  const controls = useControls({
    disabled: { type: "boolean", defaultValue: false },
    readonly: { type: "boolean", defaultValue: false },
    value: { type: "number", defaultValue: 40 },
    dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
    origin: { type: "select", options: ["center", "start"] as const, defaultValue: "start" },
  })

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
