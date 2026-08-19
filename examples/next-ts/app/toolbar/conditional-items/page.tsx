"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as toolbar from "@zag-js/toolbar"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar as ControlsPanel } from "@/components/toolbar"
import "@styles/toolbar.css"

export default function Page() {
  const [showComment, setShowComment] = useState(true)
  const service = useMachine(toolbar.machine, { id: useId() })
  const api = toolbar.connect(service, normalizeProps)

  return (
    <>
      <main className="toolbar">
        <div {...api.getRootProps()}>
          <button {...api.getItemProps({ value: "cut" })}>Cut</button>
          <button {...api.getItemProps({ value: "copy" })}>Copy</button>
          <button {...api.getItemProps({ value: "paste" })}>Paste</button>
          {showComment && <button {...api.getItemProps({ value: "comment" })}>Comment</button>}
        </div>
        <label>
          <input type="checkbox" checked={showComment} onChange={(e) => setShowComment(e.target.checked)} />
          Show Comment button
        </label>
        <p>
          Focus "Comment" (the last item), then uncheck the box above to remove it while it's still focused. Tab away
          and back — the toolbar should still have a working tab stop, not become entirely unreachable.
        </p>
      </main>

      <ControlsPanel>
        <StateVisualizer state={service} />
      </ControlsPanel>
    </>
  )
}
