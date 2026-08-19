"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as toolbar from "@zag-js/toolbar"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar as ControlsPanel } from "@/components/toolbar"
import "@styles/toolbar.css"

export default function Page() {
  const [log, setLog] = useState<string[]>([])
  const service = useMachine(toolbar.machine, { id: useId() })
  const api = toolbar.connect(service, normalizeProps)

  function onActivate(label: string) {
    setLog((prev) => [...prev, label].slice(-5))
  }

  return (
    <>
      <main className="toolbar">
        <div {...api.getRootProps()}>
          <button {...api.getItemProps({ value: "cut" })} onClick={() => onActivate("Cut")}>
            Cut
          </button>

          <button
            {...api.getItemProps({ value: "copy", disabled: true, focusableWhenDisabled: false })}
            onClick={() => onActivate("Copy")}
          >
            Copy (disabled, skipped by arrow keys)
          </button>

          <button
            {...api.getItemProps({ value: "paste", disabled: true })}
            onClick={() => {
              if (api.getItemState({ value: "paste", disabled: true }).disabled) return
              onActivate("Paste")
            }}
          >
            Paste (disabled, still reachable)
          </button>

          <button {...api.getItemProps({ value: "select-all" })} onClick={() => onActivate("Select All")}>
            Select All
          </button>
        </div>
        <p>Activated: {log.join(", ") || "(none)"}</p>
      </main>

      <ControlsPanel>
        <StateVisualizer state={service} />
      </ControlsPanel>
    </>
  )
}
