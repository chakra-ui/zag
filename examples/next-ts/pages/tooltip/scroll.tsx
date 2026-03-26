import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { ReactNode, useId } from "react"

interface TooltipProps {
  children: ReactNode
  closeOnPointerDown?: boolean
}

function Tooltip(props: TooltipProps) {
  const { children, closeOnPointerDown } = props
  const service = useMachine(tooltip.machine, {
    id: useId(),
    positioning: { placement: "right" },
    openDelay: 100,
    closeDelay: 100,
    closeOnPointerDown,
  })

  const api = tooltip.connect(service, normalizeProps)

  return (
    <>
      <button {...api.getTriggerProps()}>{children}</button>
      <Portal>
        {api.open && (
          <div {...api.getPositionerProps()}>
            <div className="tooltip-content" {...api.getContentProps()}>
              <div {...api.getArrowProps()}>
                <div {...api.getArrowTipProps()} />
              </div>
              Tooltip
            </div>
          </div>
        )}
      </Portal>
    </>
  )
}

export default function Page() {
  return (
    <main>
      <div className="root">
        <h2>Tooltip Scroll Hover Test</h2>
        <p>Hover over items, then scroll to see tooltips appear when cursor lands on items</p>
        <div
          style={{
            height: "400px",
            overflow: "auto",
            border: "1px solid #ccc",
            padding: "10px",
            marginTop: "20px",
          }}
        >
          {Array.from({ length: 100 }, (_, idx) => (
            <div key={idx} style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
              <Tooltip closeOnPointerDown={true}>item {idx}</Tooltip>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
