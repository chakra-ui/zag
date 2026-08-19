import { normalizeProps, useMachine } from "@zag-js/preact"
import * as toolbar from "@zag-js/toolbar"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar as ControlsPanel } from "../../components/toolbar"

export default function Page() {
  const service = useMachine(toolbar.machine, { id: useId(), dir: "rtl" })
  const api = toolbar.connect(service, normalizeProps)

  return (
    <>
      <main class="toolbar" dir="rtl">
        <div {...api.getRootProps()}>
          <button {...api.getItemProps({ value: "cut" })}>Cut</button>
          <button {...api.getItemProps({ value: "copy" })}>Copy</button>
          <button {...api.getItemProps({ value: "paste" })}>Paste</button>
          <button {...api.getItemProps({ value: "select-all" })}>Select All</button>
        </div>
      </main>

      <ControlsPanel>
        <StateVisualizer state={service} context={["focusedValue"]} />
      </ControlsPanel>
    </>
  )
}
