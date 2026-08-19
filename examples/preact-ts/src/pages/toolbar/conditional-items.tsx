import { normalizeProps, useMachine } from "@zag-js/preact"
import * as toolbar from "@zag-js/toolbar"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar as ControlsPanel } from "../../components/toolbar"

export default function Page() {
  const [showComment, setShowComment] = useState(true)
  const service = useMachine(toolbar.machine, { id: useId() })
  const api = toolbar.connect(service, normalizeProps)

  return (
    <>
      <main class="toolbar">
        <div {...api.getRootProps()}>
          <button {...api.getItemProps({ value: "cut" })}>Cut</button>
          <button {...api.getItemProps({ value: "copy" })}>Copy</button>
          <button {...api.getItemProps({ value: "paste" })}>Paste</button>
          {showComment && <button {...api.getItemProps({ value: "comment" })}>Comment</button>}
        </div>
        <label>
          <input
            type="checkbox"
            checked={showComment}
            onChange={(event) => setShowComment(event.currentTarget.checked)}
          />
          Show Comment button
        </label>
      </main>

      <ControlsPanel>
        <StateVisualizer state={service} />
      </ControlsPanel>
    </>
  )
}
