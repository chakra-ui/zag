import { Portal } from "@reach/portal"
import { useMachine, useSetup } from "@ui-machines/react"
import { dialog } from "@ui-machines/web"
import { StateVisualizer } from "components/state-visualizer"
import { useRef } from "react"

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null)

  // Dialog 1
  const [state, send] = useMachine(
    dialog.machine.withContext({
      initialFocusEl: () => inputRef.current,
    }),
  )
  const ref = useSetup<HTMLButtonElement>({ send, id: "123" })
  const d1 = dialog.connect(state, send)

  // Dialog 2
  const [state2, send2] = useMachine(dialog.machine)
  const ref2 = useSetup<HTMLDivElement>({ send: send2, id: "456" })
  const d2 = dialog.connect(state2, send2)

  return (
    <>
      <div ref={ref2}>
        <div className="root">
          <button ref={ref} className="dialog__button" {...d1.triggerProps}>
            Open Dialog
          </button>
          <div style={{ minHeight: "1200px" }} />
          {d1.isOpen && (
            <Portal>
              <div className="dialog__overlay" {...d1.overlayProps} />
            </Portal>
          )}
          {d1.isOpen && (
            <Portal>
              <div className="dialog__content" {...d1.contentProps}>
                <h2 className="dialog__title" {...d1.titleProps}>
                  Edit profile
                </h2>
                <p {...d1.descriptionProps}>Make changes to your profile here. Click save when you are done.</p>
                <button className="dialog__close-button" {...d1.closeButtonProps}>
                  X
                </button>
                <input type="text" ref={inputRef} placeholder="Enter name..." />
                <button>Save Changes</button>

                <button className="dialog__button" {...d2.triggerProps}>
                  Open Nested
                </button>

                {d2.isOpen && (
                  <Portal>
                    <div className="dialog__overlay" {...d2.overlayProps}>
                      <div className="dialog__content" {...d2.contentProps}>
                        <h2 className="dialog__title" {...d2.titleProps}>
                          Nested
                        </h2>
                        <button className="dialog__close-button" {...d2.closeButtonProps}>
                          X
                        </button>
                        <button onClick={() => d1.close()}>Close Dialog 1</button>
                      </div>
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
      `}</style>
    </>
  )
}
