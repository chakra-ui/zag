import * as rating from "@zag-js/rating-group"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, Index } from "solid-js"
import { Star } from "~/components/rating-icons"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/rating-group.css"

export default function Page() {
  const [value, setValue] = createSignal(2)

  const id = createUniqueId()
  const service = useMachine(rating.machine, () => ({
    id,
    value: value(),
    onValueChange(details: rating.ValueChangeDetails) {
      setValue(details.value)
    },
  }))

  const api = createMemo(() => rating.connect(service, normalizeProps))

  return (
    <>
      <main class="rating">
        <div class="vstack gap-4">
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>Rate this example</label>
            <div {...api().getControlProps()}>
              <Index each={api().items}>
                {(index) => (
                  <span {...api().getItemProps({ index: index() })}>
                    <Star />
                  </span>
                )}
              </Index>
            </div>
            <input {...api().getHiddenInputProps()} />
          </div>

          <output>Value: {value()}</output>

          <div class="hstack">
            <button type="button" onClick={() => setValue(4)}>
              Set to 4
            </button>
            <button type="button" onClick={() => setValue(0)}>
              Clear
            </button>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
