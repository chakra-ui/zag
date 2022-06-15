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
  const [state, send] = useMachine(dialog.machine)
  const ref = useSetup<HTMLButtonElement>({ send, id: createUniqueId() })
  const parentDialog = createMemo(() => dialog.connect<PropTypes>(state, send, normalizeProps))

  // dialog 2
  const [state2, send2] = useMachine(dialog.machine)
  const ref2 = useSetup({ send: send2, id: createUniqueId() })
  const childDialog = createMemo(() => dialog.connect<PropTypes>(state2, send2, normalizeProps))

  return (
    <>
      <main>
        <div ref={ref2}>
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
                  <button {...childDialog().triggerProps} data-testid="trigger-2">
                    Open Nested
                  </button>
                  {childDialog().isOpen && (
                    <Portal>
                      <div {...childDialog().backdropProps} />
                      <div {...childDialog().underlayProps} data-testid="underlay-2">
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
                  )}
                </div>
              </div>
            </Portal>
          )}
        </div>
      </main>
      <Toolbar
        controls={null}
        count={2}
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
