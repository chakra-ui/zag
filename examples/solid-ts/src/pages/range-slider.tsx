import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import serialize from "form-serialize"
import { createMemo, For, createUniqueId } from "solid-js"
import { sliderControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(sliderControls)

  const [state, send] = useMachine(
    slider.machine({
      id: createUniqueId(),
      name: "quantity",
      value: [10, 60],
    }),
    { context: controls.context as any },
  )

  const api = createMemo(() => slider.connect(state, send, normalizeProps))

  return (
    <>
      <main class="slider">
        <form
          // ensure we can read the value within forms
          onInput={(e) => {
            const formData = serialize(e.currentTarget, { hash: true })
            console.log(formData)
          }}
        >
          <div {...api().rootProps}>
            <div>
              <label {...api().labelProps}>Quantity:</label>
              <output {...api().outputProps}>{api().value.join(" - ")}</output>
            </div>
            <div class="control-area">
              <div {...api().controlProps}>
                <div {...api().trackProps}>
                  <div {...api().rangeProps} />
                </div>
                <For each={api().value}>
                  {(_, index) => (
                    <div {...api().getThumbProps({ index: index() })}>
                      <input {...api().getHiddenInputProps({ index: index() })} />
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Toolbar>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
