import { Global } from "@emotion/react"
import { Portal } from "@reach/portal"
import * as dialog from "@zag-js/dialog"
import { useMachine, useSetup } from "@zag-js/react"
import { useId, useRef } from "react"
import { dialogStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null)

  // Dialog 1
  const [state, send] = useMachine(dialog.machine)
  const ref = useSetup<HTMLButtonElement>({ send, id: useId() })
  const parentDialog = dialog.connect(state, send)

  // Dialog 2
  const [state2, send2] = useMachine(dialog.machine)
  const ref2 = useSetup({ send: send2, id: useId() })
  const childDialog = dialog.connect(state2, send2)

  return (
    <>
      <Global styles={dialogStyle} />

      <div ref={ref2}>
        <button ref={ref} {...parentDialog.triggerProps} data-testid="trigger-1">
          Open Dialog
        </button>

        <div style={{ minHeight: "1200px" }} />

        {parentDialog.isOpen && (
          <Portal>
            <div {...parentDialog.backdropProps} />
            <div data-testid="underlay-1" {...parentDialog.underlayProps}>
              <div {...parentDialog.contentProps}>
                <h2 {...parentDialog.titleProps}>Edit profile</h2>
                <p {...parentDialog.descriptionProps}>
                  Make changes to your profile here. Click save when you are done.
                </p>
                <button {...parentDialog.closeButtonProps} data-testid="close-1">
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
                    <div data-testid="underlay-2" {...childDialog.underlayProps}>
                      <div {...childDialog.contentProps}>
                        <h2 {...childDialog.titleProps}>Nested</h2>
                        <button {...childDialog.closeButtonProps} data-testid="close-2">
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

        <StateVisualizer state={state} />
        <StateVisualizer state={state2} offset="800px" />
      </div>
    </>
  )
}
