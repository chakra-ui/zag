import { css } from "@emotion/css"
import * as RangeSlider from "@ui-machines/range-slider"
import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
import serialize from "form-serialize"
import { createMemo, For, createUniqueId } from "solid-js"
import { rangeSliderStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

const styles = css(rangeSliderStyle)

export default function Page() {
  const [state, send] = useMachine(
    RangeSlider.machine.withContext({
      dir: "ltr",
      name: ["min", "max"],
      uid: "123",
      value: [10, 60],
    }),
  )

  const ref = useSetup<HTMLDivElement>({ send, id: createUniqueId() })

  const slider = createMemo(() => RangeSlider.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <div className={styles}>
      <form
        // ensure we can read the value within forms
        onInput={(e) => {
          const formData = serialize(e.currentTarget, { hash: true })
          console.log(formData)
        }}
      >
        <div className="slider" ref={ref} {...slider().rootProps}>
          <div className="slider__track" {...slider().trackProps}>
            <div className="slider__range" {...slider().rangeProps} />
          </div>
          <For each={slider().values}>
            {(val, index) => (
              <div className="slider__thumb" {...slider().getThumbProps(index())}>
                <input {...slider().getInputProps(index())} />
              </div>
            )}
          </For>
        </div>

        <StateVisualizer state={state} />
      </form>
    </div>
  )
}
