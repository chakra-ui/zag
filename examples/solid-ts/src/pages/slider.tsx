import { injectGlobal } from "@emotion/css"
import * as Slider from "@ui-machines/slider"
import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
import serialize from "form-serialize"
import { createMemo, createUniqueId } from "solid-js"
import { useControls } from "../hooks/use-controls"
import { sliderStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

injectGlobal(sliderStyle)

export default function Page() {
  const controls = useControls({
    readonly: { type: "boolean", defaultValue: false },
    disabled: { type: "boolean", defaultValue: false },
    value: { type: "number", defaultValue: 40 },
    dir: { type: "select", options: ["ltr", "rtl"] as const, defaultValue: "ltr" },
    origin: { type: "select", options: ["center", "start"] as const, defaultValue: "start" },
  })

  const [state, send] = useMachine(Slider.machine, {
    context: controls.context,
  })

  const ref = useSetup<HTMLDivElement>({ send, id: createUniqueId() })

  const slider = createMemo(() => Slider.connect<SolidPropTypes>(state, send, normalizeProps))

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
