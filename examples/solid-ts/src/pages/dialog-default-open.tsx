import { Portal } from "solid-js/web"
import * as dialog from "@zag-js/dialog"
import { useMachine, normalizeProps } from "@zag-js/solid"
import { StateVisualizer } from "../components/state-visualizer"
import { createMemo, createUniqueId } from "solid-js"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  // dialog 1
  const [state, send] = useMachine(dialog.machine({ id: createUniqueId(), defaultOpen: true }))

  const parentDialog = createMemo(() => dialog.connect(state, send, normalizeProps))

  return (
    <>
      <main>
        <div>
          <button {...parentDialog().triggerProps} data-testid="trigger-1">
            Open Dialog
          </button>
          <div style={{ "min-height": "1200px" }} />
          {parentDialog().isOpen && (
            <Portal>
              <div class="dialog-backdrop" {...parentDialog().backdropProps} />
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
