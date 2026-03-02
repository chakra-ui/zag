import * as dialog from "@zag-js/dialog"
import * as popover from "@zag-js/popover"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as React from "react"
import { useId } from "react"

function NestedPopover() {
  const service1 = useMachine(popover.machine, {
    id: useId(),
    portalled: true,
    modal: false,
  })
  const api1 = popover.connect(service1, normalizeProps)
  const Wrapper1 = api1.portalled ? Portal : React.Fragment

  const service2 = useMachine(popover.machine, {
    id: useId(),
    portalled: true,
    modal: false,
  })
  const api2 = popover.connect(service2, normalizeProps)
  const Wrapper2 = api2.portalled ? Portal : React.Fragment

  const service3 = useMachine(popover.machine, {
    id: useId(),
    portalled: true,
    modal: false,
  })
  const api3 = popover.connect(service3, normalizeProps)
  const Wrapper3 = api3.portalled ? Portal : React.Fragment

  return (
    <div>
      <button data-testid="popover-trigger-1" {...api1.getTriggerProps()}>
        Open First Popover
      </button>

      <Wrapper1>
        <div {...api1.getPositionerProps()}>
          <div data-testid="popover-content-1" className="popover-content" {...api1.getContentProps()}>
            <div {...api1.getArrowProps()}>
              <div {...api1.getArrowTipProps()} />
            </div>
            <div data-testid="popover-title-1" {...api1.getTitleProps()}>
              First Popover
            </div>
            <div data-part="body" data-testid="popover-body-1">
              <p>This is the first level popover in the dialog.</p>
              <button data-testid="popover-trigger-2" {...api2.getTriggerProps()}>
                Open Second Popover
              </button>
              <button data-testid="popover-close-button-1" {...api1.getCloseTriggerProps()}>
                Close
              </button>
            </div>
          </div>
        </div>
      </Wrapper1>

      <Wrapper2>
        <div {...api2.getPositionerProps()}>
          <div data-testid="popover-content-2" className="popover-content" {...api2.getContentProps()}>
            <div {...api2.getArrowProps()}>
              <div {...api2.getArrowTipProps()} />
            </div>
            <div data-testid="popover-title-2" {...api2.getTitleProps()}>
              Second Popover
            </div>
            <div data-part="body" data-testid="popover-body-2">
              <p>This is the second level popover.</p>
              <input data-testid="input-2" placeholder="Enter text here" />
              <button data-testid="popover-trigger-3" {...api3.getTriggerProps()}>
                Open Third Popover
              </button>
              <button data-testid="popover-close-button-2" {...api2.getCloseTriggerProps()}>
                Close
              </button>
            </div>
          </div>
        </div>
      </Wrapper2>

      <Wrapper3>
        <div {...api3.getPositionerProps()}>
          <div data-testid="popover-content-3" className="popover-content" {...api3.getContentProps()}>
            <div {...api3.getArrowProps()}>
              <div {...api3.getArrowTipProps()} />
            </div>
            <div data-testid="popover-title-3" {...api3.getTitleProps()}>
              Third Popover
            </div>
            <div data-part="body" data-testid="popover-body-3">
              <p>This is the deepest level popover.</p>
              <a href="#" data-testid="focusable-link-3">
                Focusable Link
              </a>
              <button data-testid="popover-close-button-3" {...api3.getCloseTriggerProps()}>
                Close
              </button>
            </div>
          </div>
        </div>
      </Wrapper3>
    </div>
  )
}

export default function Page() {
  const service = useMachine(dialog.machine, { id: useId() })
  const api = dialog.connect(service, normalizeProps)

  return (
    <div style={{ padding: "20px" }}>
      <button {...api.getTriggerProps()} data-testid="dialog-trigger">
        Open Dialog with Nested Popovers
      </button>
      {api.open && (
        <Portal>
          <div {...api.getBackdropProps()} />
          <div data-testid="dialog-positioner" {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <h2 {...api.getTitleProps()}>Dialog with Nested Popovers</h2>
              <p {...api.getDescriptionProps()}>
                This dialog contains multiple nested popovers. The focus trap should include all popover levels, even
                though they are portalled.
              </p>
              <div style={{ marginTop: "20px" }}>
                <NestedPopover />
              </div>
              <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button {...api.getCloseTriggerProps()} data-testid="dialog-close">
                  Close Dialog
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
