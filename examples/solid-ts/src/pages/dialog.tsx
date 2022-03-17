import { injectGlobal } from "@emotion/css"
import { Portal } from "solid-js/web"
import * as Dialog from "@ui-machines/dialog"
import { useMachine, useSetup, normalizeProps, SolidPropTypes } from "@ui-machines/solid"
import { StateVisualizer } from "../components/state-visualizer"
import { dialogStyle } from "../../../../shared/style"
import { createMemo } from "solid-js"

injectGlobal(dialogStyle)

export default function Page() {
  // Dialog 1
  const [state, send] = useMachine(Dialog.machine)
  const ref = useSetup<HTMLButtonElement>({ send, id: "1" })
  const parentDialog = createMemo(() => Dialog.connect<SolidPropTypes>(state, send, normalizeProps))

  // Dialog 2
  const [state2, send2] = useMachine(Dialog.machine)
  const ref2 = useSetup<HTMLDivElement>({ send: send2, id: "2" })
  const childDialog = createMemo(() => Dialog.connect<SolidPropTypes>(state2, send2, normalizeProps))

  return (
    <>
      <div ref={ref2}>
        <div className="root">
          <button ref={ref} className="dialog__button" {...parentDialog().triggerProps} data-testid="trigger-1">
            Open Dialog
          </button>
          <div style={{ "min-height": "1200px" }} />
          {parentDialog().isOpen && (
            <Portal>
              <div className="dialog__overlay" />
              <div className="dialog__underlay" {...parentDialog().underlayProps} data-testid="underlay-1">
                <div className="dialog__content" {...parentDialog().contentProps}>
                  <h2 className="dialog__title" {...parentDialog().titleProps}>
                    Edit profile
                  </h2>
                  <p {...parentDialog().descriptionProps}>
                    Make changes to your profile here. Click save when you are done.
                  </p>
                  <button className="dialog__close-button" {...parentDialog().closeButtonProps} data-testid="close-1">
                    X
                  </button>
                  <input type="text" placeholder="Enter name..." data-testid="input-1" />
                  <button data-testid="save-button-1">Save Changes</button>

                  <button className="dialog__button" {...childDialog().triggerProps} data-testid="trigger-2">
                    Open Nested
                  </button>

                  {childDialog().isOpen && (
                    <Portal>
                      <div className="dialog__overlay" {...childDialog().underlayProps} data-testid="underlay-2" />
                      <div className="dialog__content" {...childDialog().contentProps}>
                        <h2 className="dialog__title" {...childDialog().titleProps}>
                          Nested
                        </h2>
                        <button
                          className="dialog__close-button"
                          {...childDialog().closeButtonProps}
                          data-testid="close-2"
                        >
                          X
                        </button>
                        <button onClick={() => parentDialog().close()} data-testid="special-close">
                          Close Dialog 1
                        </button>
                      </div>
                    </Portal>
                  )}
                </div>
              </div>
            </Portal>
          )}
          <StateVisualizer state={state} />
        </div>
      </div>
    </>
  )
}
