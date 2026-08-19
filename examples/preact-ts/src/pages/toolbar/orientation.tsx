import { normalizeProps, useMachine } from "@zag-js/preact"
import * as toolbar from "@zag-js/toolbar"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar as ControlsPanel } from "../../components/toolbar"

const items = [
  { value: "bold", label: "B" },
  { value: "italic", label: "I" },
  { value: "underline", label: "U" },
]

export default function Page() {
  const service = useMachine(toolbar.machine, { id: useId(), orientation: "vertical" })
  const api = toolbar.connect(service, normalizeProps)

  return (
    <>
      <main class="toolbar">
        <div {...api.getRootProps()}>
          <button {...api.getItemProps({ value: "cut" })}>Cut</button>
          <button {...api.getItemProps({ value: "copy" })}>Copy</button>
          <button {...api.getItemProps({ value: "paste" })}>Paste</button>

          <div {...api.getSeparatorProps()} />

          <div {...api.getGroupProps({ value: "format" })}>
            {items.map((item) => (
              <button key={item.value} {...api.getItemProps({ value: item.value })}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </main>

      <ControlsPanel>
        <StateVisualizer state={service} context={["focusedValue"]} />
      </ControlsPanel>
    </>
  )
}
