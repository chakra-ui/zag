import { Global } from "@emotion/react"
import { Portal } from "@reach/portal"
import * as Dialog from "@ui-machines/dialog"
import { useMachine, useSetup } from "@ui-machines/react"
import { useRef } from "react"
import { dialogStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null)

  // Dialog 1
  const [state, send] = useMachine(Dialog.machine)
  const ref = useSetup<HTMLButtonElement>({ send, id: "1" })
  const parentDialog = Dialog.connect(state, send)

  // Dialog 2
  const [state2, send2] = useMachine(Dialog.machine)
  const ref2 = useSetup<HTMLDivElement>({ send: send2, id: "2" })
  const childDialog = Dialog.connect(state2, send2)

  return (
    <>
      <Global styles={dialogStyle} />
      <div ref={ref2}>
        <div className="root">
          <button ref={ref} className="dialog__button" {...parentDialog.triggerProps} data-testid="trigger-1">
            Open Dialog
          </button>
          <div style={{ minHeight: "1200px" }} />
          {parentDialog.isOpen && (
            <Portal>
              <div className="dialog__overlay" />
              <div className="dialog__underlay" data-testid="underlay-1" {...parentDialog.underlayProps}>
                <div className="dialog__content" {...parentDialog.contentProps}>
                  <h2 className="dialog__title" {...parentDialog.titleProps}>
                    Edit profile
                  </h2>
                  <p {...parentDialog.descriptionProps}>
                    Make changes to your profile here. Click save when you are done.
                  </p>
                  <button className="dialog__close-button" {...parentDialog.closeButtonProps} data-testid="close-1">
                    X
                  </button>
                  <input type="text" ref={inputRef} placeholder="Enter name..." data-testid="input-1" />
                  <button data-testid="save-button-1">Save Changes</button>

                  <button className="dialog__button" {...childDialog.triggerProps} data-testid="trigger-2">
                    Open Nested
                  </button>

                  {childDialog.isOpen && (
                    <Portal>
                      <div className="dialog__overlay" />
                      <div className="dialog__underlay" data-testid="underlay-2" {...childDialog.underlayProps}>
                        <div className="dialog__content" {...childDialog.contentProps}>
                          <h2 className="dialog__title" {...childDialog.titleProps}>
                            Nested
                          </h2>
                          <button
                            className="dialog__close-button"
                            {...childDialog.closeButtonProps}
                            data-testid="close-2"
                          >
                            X
                          </button>
                          <button onClick={() => parentDialog.close()} data-testid="special-close">
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
          {/* <StateVisualizer state={state} />
          <StateVisualizer state={state2} offset="800px" /> */}
        </div>
      </div>
    </>
  )
}
