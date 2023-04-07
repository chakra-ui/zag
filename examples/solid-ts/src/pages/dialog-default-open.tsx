import { Portal } from "solid-js/web"
import * as dialog from "@zag-js/dialog"
import { useMachine, normalizeProps } from "@zag-js/solid"
import { StateVisualizer } from "../components/state-visualizer"
import { createMemo, createUniqueId, Show } from "solid-js"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  // dialog 1
  const [state, send] = useMachine(dialog.machine({ id: createUniqueId(), open: true }))

  const parentDialog = createMemo(() => dialog.connect(state, send, normalizeProps))

  return (
    <>
      <main>
        <div>
          <button {...parentDialog().triggerProps} data-testid="trigger-1">
            Open Dialog
          </button>
          <div style={{ "min-height": "1200px" }} />
          <Show when={parentDialog().isOpen}>
            <Portal>
              <div {...parentDialog().backdropProps} />
              <div {...parentDialog().containerProps} data-testid="container-1">
                <div {...parentDialog().contentProps}>
                  <h2 {...parentDialog().titleProps}>Edit profile</h2>
                  <p {...parentDialog().descriptionProps}>
                    Make changes to your profile here. Click save when you are done.
                  </p>
                  <button {...parentDialog().closeTriggerProps} data-testid="close-1">
                    X
                  </button>
                  <input type="text" placeholder="Enter name..." data-testid="input-1" />
                  <button data-testid="save-button-1">Save Changes</button>
                </div>
              </div>
            </Portal>
          </Show>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
