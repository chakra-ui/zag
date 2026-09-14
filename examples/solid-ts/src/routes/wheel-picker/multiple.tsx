import * as wheelPicker from "@zag-js/wheel-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createUniqueId } from "solid-js"
const numbers = (length: number, add = 0) =>
  wheelPicker.collection({
    items: Array.from({ length }, (_, i) => ({ label: String(i + add).padStart(2, "0"), value: String(i + add) })),
  })
const hour = numbers(12, 1),
  minute = numbers(60),
  period = wheelPicker.collection({ items: ["AM", "PM"].map((value) => ({ label: value, value })) })

function Picker(props: { label: string; collection: typeof hour; value: string; infinite?: boolean }) {
  const id = createUniqueId()
  const service = useMachine(wheelPicker.machine, {
    id,
    collection: props.collection,
    defaultValue: props.value,
    infinite: props.infinite,
  })
  const api = createMemo(() => wheelPicker.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <label class="sr-only" {...api().getLabelProps()}>
        {props.label}
      </label>
      <div {...api().getControlProps()}>
        <div {...api().getViewportProps()}>
          <ul {...api().getItemGroupProps()}>
            <For each={api().items}>
              {({ item, index }) => <li {...api().getItemProps({ item, index })}>{item.label}</li>}
            </For>
          </ul>
          <div {...api().getHighlightProps()}>
            <ul {...api().getHighlightItemGroupProps()}>
              <For each={api().highlightItems}>
                {({ item, index }) => <li {...api().getHighlightItemProps({ item, index })}>{item.label}</li>}
              </For>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
export default function Page() {
  return (
    <main class="wheel-picker">
      <div class="wheel-picker-group" role="group" aria-label="Time">
        <Picker label="Hour" collection={hour} value="9" infinite />
        <Picker label="Minute" collection={minute} value="41" infinite />
        <Picker label="Meridiem" collection={period} value="AM" />
      </div>
    </main>
  )
}
