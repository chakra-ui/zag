import { useMachine, useSetup } from "@ui-machines/react"
import { dialog } from "@ui-machines/web"
import { StateVisualizer } from "components/state-visualizer"
import { Portal } from "@reach/portal"
import { useRef } from "react"

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null)

  const [state, send] = useMachine(
    dialog.machine.withContext({
      initialFocusEl: () => inputRef.current,
    }),
  )

  const ref = useSetup<HTMLButtonElement>({ send, id: "123" })

  const { isOpen, triggerProps, overlayProps, contentProps, titleProps, descriptionProps, closeButtonProps } =
    dialog.connect(state, send)

  return (
    <>
      <div>
        <div className="root">
          <button ref={ref} className="dialog__button" {...triggerProps}>
            Open Dialog
          </button>
          <div style={{ minHeight: "1200px" }} />
          {isOpen && (
            <Portal>
              <div className="dialog__overlay" {...overlayProps} />
            </Portal>
          )}
          {isOpen && (
            <Portal>
              <div className="dialog__content" {...contentProps}>
                <h2 className="dialog__title" {...titleProps}>
                  Edit profile
                </h2>
                <p {...descriptionProps}>Make changes to your profile here. Click save when you are done.</p>
                <input type="text" ref={inputRef} style={{ padding: "10px" }} />
                <button>Save Changes</button>
                <button {...closeButtonProps}>X</button>
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
      `}</style>
    </>
  )
}
