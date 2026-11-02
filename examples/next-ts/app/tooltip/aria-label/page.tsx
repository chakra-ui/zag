"use client"

import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { Presence } from "@/components/presence"
import "@styles/tooltip.css"

export default function Page() {
  const id = "tip-1"
  const service = useMachine(tooltip.machine, { id, "aria-label": "Save the document" })
  const api = tooltip.connect(service, normalizeProps)

  return (
    <>
      <main className="tooltip">
        <div className="root">
          <button data-testid={`${id}-trigger`} {...api.getTriggerProps()}>
            Save
          </button>
          <Portal>
            <div {...api.getPositionerProps()}>
              <Presence className="tooltip-content" data-testid={`${id}-tooltip`} {...api.getContentProps()}>
                Save <kbd>⌘S</kbd>
              </Presence>
            </div>
          </Portal>
        </div>
      </main>
      <Toolbar controls={null}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
