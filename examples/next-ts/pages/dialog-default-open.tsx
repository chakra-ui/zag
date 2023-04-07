import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { useId, useRef } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null)

  const [state, send] = useMachine(
    dialog.machine({
      id: useId(),
      open: true,
    }),
  )
  const api = dialog.connect(state, send, normalizeProps)

  return (
    <>
      <main>
        <div>
          <button {...api.triggerProps} data-testid="trigger-1">
            Open Dialog
          </button>

          <div style={{ minHeight: "1200px" }} />

          {api.isOpen && (
            <Portal>
              <div {...api.backdropProps} />
              <div data-testid="container-1" {...api.containerProps}>
                <div {...api.contentProps}>
                  <h2 {...api.titleProps}>Edit profile</h2>
                  <p {...api.descriptionProps}>Make changes to your profile here. Click save when you are done.</p>
                  <button {...api.closeTriggerProps} data-testid="close-1">
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
