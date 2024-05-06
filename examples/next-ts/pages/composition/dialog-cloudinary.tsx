import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { XIcon } from "lucide-react"
import { CldUploadWidget } from "next-cloudinary"
import { useEffect, useId, useRef, useState } from "react"

export default function Page() {
  const [isCloudinaryOpen, setIsCloudinaryOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const [state, send] = useMachine(dialog.machine({ id: useId() }))

  const api = dialog.connect(state, send, normalizeProps)

  useEffect(() => {
    if (!isCloudinaryOpen) return
    const frame = document.querySelector<HTMLIFrameElement>("[data-test=uw-iframe]")
    if (!frame) return
    const prevPointerEvent = frame.style.pointerEvents
    Object.assign(frame.style, { pointerEvents: "auto" })
    return () => {
      Object.assign(frame.style, { pointerEvents: prevPointerEvent })
    }
  }, [isCloudinaryOpen])

  return (
    <div>
      <button {...api.triggerProps}>Open Dialog</button>
      {api.open && (
        <Portal>
          <div {...api.backdropProps} />
          <div {...api.positionerProps}>
            <div {...api.contentProps}>
              <h2 {...api.titleProps}>Edit profile</h2>
              <p {...api.descriptionProps}>Make changes to your profile here. Click save when you are done.</p>

              <CldUploadWidget
                onOpen={() => setIsCloudinaryOpen(true)}
                onClose={() => {
                  setIsCloudinaryOpen(false)
                  buttonRef.current.focus()
                }}
              >
                {({ open }) => {
                  return (
                    <button ref={buttonRef} onClick={() => open()}>
                      Upload an Image
                    </button>
                  )
                }}
              </CldUploadWidget>

              <button {...api.closeTriggerProps}>
                <XIcon />
              </button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
