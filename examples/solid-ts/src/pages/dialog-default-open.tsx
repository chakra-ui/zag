import { injectGlobal } from "@emotion/css"
import { Portal } from "solid-js/web"
import * as dialog from "@zag-js/dialog"
import { useMachine, useSetup, normalizeProps, PropTypes } from "@zag-js/solid"
import { StateVisualizer } from "../components/state-visualizer"
import { dialogStyle } from "@zag-js/shared"
import { createMemo, createUniqueId } from "solid-js"
import { Toolbar } from "../components/toolbar"

injectGlobal(dialogStyle)

export default function Page() {
  // dialog 1
  const [state, send] = useMachine(dialog.machine({ open: true }))
  const ref = useSetup<HTMLButtonElement>({ send, id: createUniqueId() })
  const parentDialog = createMemo(() => dialog.connect<PropTypes>(state, send, normalizeProps))

  return (
    <>
      <main>
        <div>
          <button ref={ref} {...parentDialog().triggerProps} data-testid="trigger-1">
            Open Dialog
          </button>
          <div style={{ "min-height": "1200px" }} />
          {parentDialog().isOpen && (
            <Portal>
              <div {...parentDialog().backdropProps} />
              <div {...parentDialog().underlayProps} data-testid="underlay-1">
                <div {...parentDialog().contentProps}>
                  <h2 {...parentDialog().titleProps}>Edit profile</h2>
                  <p {...parentDialog().descriptionProps}>
                    Make changes to your profile here. Click save when you are done.
                  </p>
                  <button {...parentDialog().closeButtonProps} data-testid="close-1">
                    X
                  </button>
                  <input type="text" placeholder="Enter name..." data-testid="input-1" />
                  <button data-testid="save-button-1">Save Changes</button>
                </div>
              </div>
            </Portal>
          )}
        </div>
      </main>
      <Toolbar controls={null} visualizer={<StateVisualizer state={state} />} />
    </>
  )
}
