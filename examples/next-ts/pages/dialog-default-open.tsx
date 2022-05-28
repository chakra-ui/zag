import { Global } from "@emotion/react"
import * as dialog from "@zag-js/dialog"
import { useMachine, useSetup } from "@zag-js/react"
import { useId, useRef } from "react"
import { dialogStyle } from "../../../shared/style"
import { Portal } from "../components/portal"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null)

  const [state, send] = useMachine(dialog.machine({ isOpen: true }))
  const ref = useSetup<HTMLButtonElement>({ send, id: useId() })
  const parentDialog = dialog.connect(state, send)

  return (
    <>
      <Global styles={dialogStyle} />

      <main>
        <div>
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
                  <button data-testid="save-button">Save Changes</button>
                </div>
              </div>
            </Portal>
          )}
        </div>
      </main>
      <Toolbar controls={null}>
        <StateVisualizer label="Dialog 1" state={state} />
      </Toolbar>
    </>
  )
}
