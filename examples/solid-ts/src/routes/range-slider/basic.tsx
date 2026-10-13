import { sliderControls } from "@zag-js/shared"
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import serialize from "form-serialize"
import { Index, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/slider.css"

export default function Page() {
  const controls = useControls(sliderControls)

  const service = useMachine(
    slider.machine,
    controls.mergeProps<slider.Props>({
      thumbSize: 20,
      id: createUniqueId(),
      name: "quantity",
      defaultValue: [10, 60],
    }),
  )

  const api = createMemo(() => slider.connect(service, normalizeProps))

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
          <div {...api().getRootProps()}>
            <div>
              <label {...api().getLabelProps()}>Quantity:</label>
              <output {...api().getValueTextProps()}>{api().value.join(" - ")}</output>
            </div>
            <div class="control-area">
              <div {...api().getControlProps()}>
                <div {...api().getTrackProps()}>
                  <div {...api().getRangeProps()} />
                </div>
                <Index each={api().value}>
                  {(_, index) => (
                    <div {...api().getThumbProps({ index })}>
                      <input {...api().getHiddenInputProps({ index })} />
                    </div>
                  )}
                </Index>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
