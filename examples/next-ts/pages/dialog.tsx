import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { useId, useRef } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null)

  // Dialog 1
  const [state, send] = useMachine(
    dialog.machine({
      id: useId(),
    }),
  )
  const parentDialog = dialog.connect(state, send, normalizeProps)

  // Dialog 2
  const [state2, send2] = useMachine(
    dialog.machine({
      id: useId(),
    }),
  )
  const childDialog = dialog.connect(state2, send2, normalizeProps)

  return (
    <>
      <main>
        <div>
          <button {...parentDialog.triggerProps} data-testid="trigger-1">
            Open Dialog
          </button>

          <div style={{ minHeight: "1200px" }} />

          {parentDialog.isOpen && (
            <Portal>
              <div {...parentDialog.backdropProps} />
              <div data-testid="positioner-1" {...parentDialog.positionerProps}>
                <div {...parentDialog.contentProps}>
                  <h2 {...parentDialog.titleProps}>Edit profile</h2>
                  <p {...parentDialog.descriptionProps}>
                    Make changes to your profile here. Click save when you are done.
                  </p>
                  <button {...parentDialog.closeTriggerProps} data-testid="close-1">
                    X
                  </button>
                  <input type="text" ref={inputRef} placeholder="Enter name..." data-testid="input-1" />
                  <button data-testid="save-button-1">Save Changes</button>

                  <button {...childDialog.triggerProps} data-testid="trigger-2">
                    Open Nested
                  </button>

                  {childDialog.isOpen && (
                    <Portal>
                      <div {...childDialog.backdropProps} />
                      <div data-testid="positioner-2" {...childDialog.positionerProps}>
                        <div {...childDialog.contentProps}>
                          <h2 {...childDialog.titleProps}>Nested</h2>
                          <button {...childDialog.closeTriggerProps} data-testid="close-2">
                            X
                          </button>
                          <button onClick={() => parentDialog.close()} data-testid="special-close">
                            Close Dialog 1
                          </button>
                        </div>
                      </div>
                    </Portal>
                  )}
                </div>
              </div>
            </Portal>
          )}
        </div>
      </main>
      <Toolbar controls={null}>
        <StateVisualizer label="Dialog 1" state={state} />
        <StateVisualizer label="Dialog 2" state={state2} />
      </Toolbar>
    </>
  )
}
