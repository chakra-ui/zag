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
          <div {...api().getRootProps()} class={styles.Root}>
            <div>
              <label {...api().getLabelProps()}>Quantity:</label>
              <output {...api().getValueTextProps()} class={styles.ValueText}>{api().value.join(" - ")}</output>
            </div>
            <div class="control-area">
              <div {...api().getControlProps()} class={styles.Control}>
                <div {...api().getTrackProps()} class={styles.Track}>
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
