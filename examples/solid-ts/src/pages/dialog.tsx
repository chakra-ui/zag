import { injectGlobal } from "@emotion/css"
import { Portal } from "solid-js/web"
import * as Dialog from "@zag-js/dialog"
import { useMachine, useSetup, normalizeProps, PropTypes } from "@zag-js/solid"
import { StateVisualizer } from "../components/state-visualizer"
import { dialogStyle } from "../../../../shared/style"
import { createMemo } from "solid-js"

injectGlobal(dialogStyle)

export default function Page() {
  // Dialog 1
  const [state, send] = useMachine(Dialog.machine)
  const ref = useSetup<HTMLButtonElement>({ send, id: "1" })
  const parentDialog = createMemo(() => Dialog.connect<PropTypes>(state, send, normalizeProps))

  // Dialog 2
  const [state2, send2] = useMachine(Dialog.machine)
  const ref2 = useSetup({ send: send2, id: "2" })
  const childDialog = createMemo(() => Dialog.connect<PropTypes>(state2, send2, normalizeProps))

  return (
    <>
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

        <StateVisualizer state={state} />
      </div>
    </>
  )
}
