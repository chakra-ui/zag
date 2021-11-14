import { rangeSlider } from "@ui-machines/web"
import { normalizeProps, useMachine, useSetup, SolidPropTypes } from "@ui-machines/solid"

import { createMemo, For } from "solid-js"
import { css, CSSObject } from "@emotion/css"
import serialize from "form-serialize"

import { StateVisualizer } from "../components/state-visualizer"
import { rangeSliderStyle } from "../../../../shared/style"

const styles = css(rangeSliderStyle as CSSObject)

export default function Page() {
  const [state, send] = useMachine(
    rangeSlider.machine.withContext({
      dir: "ltr",
      name: ["min", "max"],
      uid: "123",
      value: [10, 60],
    }),
  )

  const ref = useSetup<HTMLDivElement>({ send, id: "123" })

  const machineState = createMemo(() => rangeSlider.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <div className={styles}>
      <form
        // ensure we can read the value within forms
        onInput={(e) => {
          const formData = serialize(e.currentTarget, { hash: true })
          console.log(formData)
        }}
      >
        <div className="slider" ref={ref} {...machineState().rootProps}>
          <div className="slider__track" {...machineState().trackProps}>
            <div className="slider__range" {...machineState().rangeProps} />
          </div>
          <For each={machineState().values}>
            {(val, index) => (
              <div className="slider__thumb" {...machineState().getThumbProps(index())}>
                <input {...machineState().getInputProps(index())} />
              </div>
            )}
          </For>
        </div>

        <StateVisualizer state={state} />
      </form>
    </div>
  )
}
