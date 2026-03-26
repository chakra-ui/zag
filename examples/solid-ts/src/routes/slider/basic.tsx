import styles from "../../../../../shared/src/css/slider.module.css"
import { sliderControls } from "@zag-js/shared"
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import serialize from "form-serialize"
import { For, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(sliderControls)

  const service = useMachine(
    slider.machine,
    controls.mergeProps<slider.Props>({
      id: createUniqueId(),
      defaultValue: [0],
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
          <div {...api().getRootProps()} class={styles.Root}>
            <div>
              <label data-testid="label" {...api().getLabelProps()}>
                Slider Label
              </label>
              <output data-testid="output" {...api().getValueTextProps()} class={styles.ValueText}>
                {api().value.at(0)}
              </output>
            </div>
            <div class="control-area">
              <div {...api().getControlProps()} class={styles.Control}>
                <div data-testid="track" {...api().getTrackProps()} class={styles.Track}>
                  <div {...api().getRangeProps()} class={styles.Range} />
                </div>
                <For each={api().value}>
                  {(_, index) => (
                    <div {...api().getThumbProps({ index: index() })}>
                      <input {...api().getHiddenInputProps({ index: index() })} />
                    </div>
                  )}
                </For>
              </div>
              <div {...api().getMarkerGroupProps()} class={styles.MarkerGroup}>
                <span {...api().getMarkerProps({ value: 10 })} class={styles.Marker}>*</span>
                <span {...api().getMarkerProps({ value: 30 })} class={styles.Marker}>*</span>
                <span {...api().getMarkerProps({ value: 90 })} class={styles.Marker}>*</span>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
