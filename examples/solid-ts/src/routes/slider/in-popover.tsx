import * as popover from "@zag-js/popover"
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/slider.css"
import "@styles/popover.css"

function PriceSlider() {
  const service = useMachine(slider.machine, {
    id: createUniqueId(),
    name: "price",
    defaultValue: [20, 60],
    thumbSize: 20,
  })

  const api = createMemo(() => slider.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <label {...api().getLabelProps()}>Price</label>
      <output {...api().getValueTextProps()}>{api().value.join(" – ")}</output>
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
  )
}

export default function Page() {
  const service = useMachine(popover.machine, { id: createUniqueId() })
  const api = createMemo(() => popover.connect(service, normalizeProps))

  return (
    <main>
      <button {...api().getTriggerProps()}>Filters</button>
      <Show when={api().open}>
        <Portal>
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <PriceSlider />
            </div>
          </div>
        </Portal>
      </Show>
    </main>
  )
}
