"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as toolbar from "@zag-js/toolbar"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar as ControlsPanel } from "@/components/toolbar"
import "@styles/toolbar.css"

export default function Page() {
  const [dir, setDir] = useState<"ltr" | "rtl">("rtl")
  const service = useMachine(toolbar.machine, { id: useId(), dir })
  const api = toolbar.connect(service, normalizeProps)

  return (
    <>
      <main className="toolbar" dir={dir}>
        <label>
          <input type="checkbox" checked={dir === "rtl"} onChange={(e) => setDir(e.target.checked ? "rtl" : "ltr")} />
          RTL
        </label>

        <div {...api.getRootProps()}>
          <button {...api.getItemProps({ value: "cut" })}>Cut</button>
          <button {...api.getItemProps({ value: "copy" })}>Copy</button>
          <button {...api.getItemProps({ value: "paste" })}>Paste</button>
          <button {...api.getItemProps({ value: "select-all" })}>Select All</button>
        </div>

        <p>
          With <code>dir="rtl"</code>, ArrowLeft moves forward (toward the visual start) and ArrowRight moves backward —
          matching reading direction.
        </p>
      </main>

      <ControlsPanel>
        <StateVisualizer state={service} />
      </ControlsPanel>
    </>
  )
}
