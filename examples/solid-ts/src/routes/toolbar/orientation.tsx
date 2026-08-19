import { normalizeProps, useMachine } from "@zag-js/solid"
import * as toolbar from "@zag-js/toolbar"
import { For, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar as ControlsPanel } from "~/components/toolbar"
import "@styles/toolbar.css"

const items = [
  { value: "bold", label: "B" },
  { value: "italic", label: "I" },
  { value: "underline", label: "U" },
]

export default function Page() {
  const service = useMachine(toolbar.machine, {
    id: createUniqueId(),
    orientation: "vertical",
  })
  const api = createMemo(() => toolbar.connect(service, normalizeProps))

  return (
    <>
      <main class="toolbar">
        <div {...api().getRootProps()}>
          <button {...api().getItemProps({ value: "cut" })}>Cut</button>
          <button {...api().getItemProps({ value: "copy" })}>Copy</button>
          <button {...api().getItemProps({ value: "paste" })}>Paste</button>

          <div {...api().getSeparatorProps()} />

          <div {...api().getGroupProps({ value: "format" })}>
            <For each={items}>
              {(item) => <button {...api().getItemProps({ value: item.value })}>{item.label}</button>}
            </For>
          </div>
        </div>
      </main>

      <ControlsPanel viz>
        <StateVisualizer state={service} />
      </ControlsPanel>
    </>
  )
}
