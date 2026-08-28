"use client"

import * as floating from "@zag-js/floating-panel"
import { normalizeProps, useMachine } from "@zag-js/react"
import { XIcon } from "lucide-react"
import { useId } from "react"
import "@styles/floating-panel.css"

interface PanelProps {
  name: string
  offset: number
}

function Panel(props: PanelProps) {
  const { name, offset } = props

  const service = useMachine(floating.machine, {
    id: useId(),
    defaultPosition: { x: 100 + offset, y: 100 + offset },
  })

  const api = floating.connect(service, normalizeProps)

  return (
    <div>
      <button {...api.getTriggerProps()} data-testid={`trigger-${name}`}>
        Toggle {name}
      </button>
      <div {...api.getPositionerProps()} data-testid={`positioner-${name}`}>
        <div {...api.getContentProps()} data-testid={`content-${name}`}>
          <div {...api.getDragTriggerProps()}>
            <div {...api.getHeaderProps()}>
              <p {...api.getTitleProps()}>Panel {name}</p>
              <div {...api.getControlProps()}>
                <button {...api.getCloseTriggerProps()} data-testid={`close-${name}`}>
                  <XIcon />
                </button>
              </div>
            </div>
          </div>
          <div {...api.getBodyProps()}>
            <p>Content {name}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <main className="floating-panel">
      <div style={{ display: "flex", gap: "12px" }}>
        <Panel name="A" offset={0} />
        <Panel name="B" offset={40} />
      </div>
    </main>
  )
}
