import * as hoverCard from "@zag-js/hover-card"
import * as dialog from "@zag-js/dialog"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useRef } from "react"

function HoverCard(props: { portalRef: React.RefObject<HTMLElement> }) {
  const service = useMachine(hoverCard.machine, { id: useId() })
  const api = hoverCard.connect(service, normalizeProps)
  return (
    <>
      <a href="https://twitter.com/zag_js" target="_blank" rel="noreferrer" {...api.getTriggerProps()}>
        Twitter
      </a>
      {api.open && (
        <Portal container={props.portalRef}>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()} style={{ width: "200px", height: "200px" }}>
              <div {...api.getArrowProps()}>
                <div {...api.getArrowTipProps()} />
              </div>
              Twitter Preview
              <a href="https://twitter.com/zag_js" target="_blank" rel="noreferrer">
                Twitter
              </a>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}

export default function Page() {
  const service = useMachine(dialog.machine, { id: useId(), initialFocusEl: null })
  const api = dialog.connect(service, normalizeProps)
  const contentRef = useRef<HTMLDivElement>(null)
  return (
    <div style={{ padding: "20px" }}>
      <button {...api.getTriggerProps()} data-testid="trigger-1">
        Open Dialog
      </button>
      {api.open && (
        <Portal>
          <div {...api.getBackdropProps()} />
          <div data-testid="positioner-1" {...api.getPositionerProps()}>
            <div ref={contentRef} {...api.getContentProps()} style={{ width: "400px", height: "400px" }}>
              <HoverCard portalRef={contentRef} />
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
