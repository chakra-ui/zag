import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"

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
          <button {...parentDialog().getTriggerProps()} data-testid="trigger-1">
            Open Dialog
          </button>
          <div style={{ "min-height": "1200px" }} />

          <Show when={parentDialog().open}>
            <Portal>
              <div {...parentDialog().getBackdropProps()} />
              <div {...parentDialog().getPositionerProps()} data-testid="positioner-1">
                <div {...parentDialog().getContentProps()}>
                  <h2 {...parentDialog().getTitleProps()}>Edit profile</h2>
                  <p {...parentDialog().getDescriptionProps()}>
                    Make changes to your profile here. Click save when you are done.
                  </p>
                  <button {...parentDialog().getCloseTriggerProps()} data-testid="close-1">
                    X
                  </button>
                  <input type="text" placeholder="Enter name..." data-testid="input-1" />
                  <button data-testid="save-button-1">Save Changes</button>

                  <button {...childDialog().getTriggerProps()} data-testid="trigger-2">
                    Open Nested
                  </button>
                  <Show when={childDialog().open}>
                    <Portal>
                      <div {...childDialog().getBackdropProps()} />
                      <div {...childDialog().getPositionerProps()} data-testid="positioner-2">
                        <div {...childDialog().getContentProps()}>
                          <h2 {...childDialog().getTitleProps()}>Nested</h2>
                          <button {...childDialog().getCloseTriggerProps()} data-testid="close-2">
                            X
                          </button>
                          <button onClick={() => parentDialog().setOpen(false)} data-testid="special-close">
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

      <Toolbar controls={null}>
        <StateVisualizer state={state} />
        <StateVisualizer state={state2} />
      </Toolbar>
    </>
  )
}
