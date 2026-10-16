import { sliderControls } from "@zag-js/shared"
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
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
      id: createUniqueId(),
      name: "volume",
      defaultValue: [0],
      thumbSize: 20,
    }),
  )

  const api = createMemo(() => slider.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Volume</label>
          <output {...api().getValueTextProps()}>{api().value}</output>
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
      </main>
      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
