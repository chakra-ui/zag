"use client"

import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { Presence } from "@/components/presence"
import "@styles/tooltip.css"

export default function Page() {
  const id = "tip-interactive"
  const service = useMachine(tooltip.machine, {
    id,
    interactive: true,
    positioning: { gutter: 16 },
  })

  const api = tooltip.connect(service, normalizeProps)

  return (
    <>
      <main className="tooltip">
        <div className="root">
          <button data-testid={`${id}-trigger`} {...api.getTriggerProps()}>
            Hover me
          </button>
          <span data-testid="sibling">Sibling text</span>
          <Portal>
            <div {...api.getPositionerProps()}>
              <Presence
                className="tooltip-content"
                data-testid={`${id}-tooltip`}
                style={{ width: 240 }}
                {...api.getContentProps()}
              >
                Interactive tooltip.{" "}
                <a href="https://zagjs.com" target="_blank" rel="noreferrer">
                  A link you can reach
                </a>
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
