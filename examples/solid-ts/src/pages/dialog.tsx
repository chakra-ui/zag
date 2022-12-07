import { Portal } from "solid-js/web"
import * as dialog from "@zag-js/dialog"
import { useMachine, normalizeProps } from "@zag-js/solid"
import { StateVisualizer } from "../components/state-visualizer"
import { createMemo, createUniqueId, Show } from "solid-js"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  // dialog 1
  const [state, send] = useMachine(dialog.machine({ id: createUniqueId() }))

  const parentDialog = createMemo(() => dialog.connect(state, send, normalizeProps))

  // dialog 2
  const [state2, send2] = useMachine(dialog.machine({ id: createUniqueId() }))

  const childDialog = createMemo(() => dialog.connect(state2, send2, normalizeProps))

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
              <div class="dialog-backdrop" {...parentDialog().backdropProps} />
              <div {...parentDialog().containerProps} data-testid="container-1">
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

                  <button {...childDialog().triggerProps} data-testid="trigger-2">
                    Open Nested
                  </button>
                  <Show when={childDialog().isOpen}>
                    <Portal>
                      <div class="dialog-backdrop" {...childDialog().backdropProps} />
                      <div {...childDialog().containerProps} data-testid="container-2">
                        <div {...childDialog().contentProps}>
                          <h2 {...childDialog().titleProps}>Nested</h2>
                          <button {...childDialog().closeButtonProps} data-testid="close-2">
                            X
                          </button>
                          <button onClick={() => parentDialog().close()} data-testid="special-close">
                            Close Dialog 1
                          </button>
                        </div>
                      </div>
                    </Portal>
                  </Show>
                </div>
              </div>
            </Portal>
          </Show>
        </div>
      </main>

      <Toolbar
        controls={null}
        visualizer={
          <>
            <StateVisualizer state={state} />
            <StateVisualizer state={state2} />
          </>
        }
      />
    </>
  )
}
