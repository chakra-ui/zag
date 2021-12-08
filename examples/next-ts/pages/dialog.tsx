import { Portal } from "@reach/portal"
import * as Dialog from "@ui-machines/dialog"
import { useMachine, useSetup } from "@ui-machines/react"
import { StateVisualizer } from "components/state-visualizer"
import { useRef } from "react"

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null)

  // Dialog 1
  const [state, send] = useMachine(Dialog.machine)
  const ref = useSetup<HTMLButtonElement>({ send, id: "123" })
  const parentDialog = Dialog.connect(state, send)

  // Dialog 2
  const [state2, send2] = useMachine(Dialog.machine)
  const ref2 = useSetup<HTMLDivElement>({ send: send2, id: "456" })
  const childDialog = Dialog.connect(state2, send2)

  return (
    <>
      <div ref={ref2}>
        <div className="root">
          <button ref={ref} className="dialog__button" {...parentDialog.triggerProps} data-testid="trigger-1">
            Open Dialog
          </button>
          <div style={{ minHeight: "1200px" }} />
          {parentDialog.isOpen && (
            <Portal>
              <div className="dialog__overlay" {...parentDialog.overlayProps} data-testid="overlay-1" />
            </Portal>
          )}
          {parentDialog.isOpen && (
            <Portal>
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
                    <div className="dialog__overlay" {...childDialog.overlayProps} data-testid="overlay-2" />
                  </Portal>
                )}
                {childDialog.isOpen && (
                  <Portal>
                    <div className="dialog__content" {...childDialog.contentProps}>
                      <h2 className="dialog__title" {...childDialog.titleProps}>
                        Nested
                      </h2>
                      <button className="dialog__close-button" {...childDialog.closeButtonProps} data-testid="close-2">
                        X
                      </button>
                      <button onClick={() => parentDialog.close()} data-testid="special-close">
                        Close Dialog 1
                      </button>
                    </div>
                  </Portal>
                )}
              </div>
            </Portal>
          )}
          <StateVisualizer state={state} />
        </div>
      </div>
      <style jsx>{`
        .dialog__overlay {
          background-color: rgba(0, 0, 0, 0.44);
          position: fixed;
          inset: 0px;
        }
        .dialog__title {
          margin: 0px;
          font-weight: 500;
          color: rgb(26, 21, 35);
          font-size: 17px;
        }
        .dialog__description {
          margin: 10px 0px 20px;
          color: rgb(111, 110, 119);
          font-size: 15px;
          line-height: 1.5;
        }
        .dialog__content {
          background-color: white;
          border-radius: 6px;
          box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90vw;
          max-width: 450px;
          max-height: 85vh;
          padding: 25px;
        }

        .dialog__close-button {
          font-family: inherit;
          height: 25px;
          width: 25px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: rgb(87, 70, 175);
          position: absolute;
          top: 10px;
          right: 10px;
          border-radius: 100%;
        }

        .dialog__close-button:focus {
          outline: 2px blue solid;
          outline-offset: 2px;
        }
      `}</style>
    </>
  )
}
