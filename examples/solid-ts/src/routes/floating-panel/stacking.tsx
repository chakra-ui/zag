import * as floatingPanel from "@zag-js/floating-panel"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { createMemo, createUniqueId } from "solid-js"

interface PanelProps {
  name: string
  offset: number
}

function Panel(props: PanelProps) {
  const service = useMachine(floatingPanel.machine, {
    id: createUniqueId(),
    defaultPosition: { x: 100 + props.offset, y: 100 + props.offset },
  })

  const api = createMemo(() => floatingPanel.connect(service, normalizeProps))

  return (
    <div>
      <button {...api().getTriggerProps()} data-testid={`trigger-${props.name}`}>
        Toggle {props.name}
      </button>
      <div {...api().getPositionerProps()} data-testid={`positioner-${props.name}`}>
        <div {...api().getContentProps()} data-testid={`content-${props.name}`}>
          <div {...api().getDragTriggerProps()}>
            <div {...api().getHeaderProps()}>
              <p {...api().getTitleProps()}>Panel {props.name}</p>
              <div {...api().getControlProps()}>
                <button {...api().getCloseTriggerProps()} data-testid={`close-${props.name}`}>
                  <XIcon />
                </button>
              </div>
            </div>
          </div>
          <div {...api().getBodyProps()}>
            <p>Content {props.name}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <main class="floating-panel">
      <div style={{ display: "flex", gap: "12px" }}>
        <Panel name="A" offset={0} />
        <Panel name="B" offset={40} />
      </div>
    </main>
  )
}
