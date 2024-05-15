import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { XIcon } from "lucide-react"
import { CldUploadWidget } from "next-cloudinary"
import { useId, useRef } from "react"

function getCloudinaryIframe() {
  return document.querySelector("[data-test=uw-iframe]")
}

export default function Page() {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const [state, send] = useMachine(
    dialog.machine({
      id: useId(),
      persistentElements: [getCloudinaryIframe],
    }),
  )

  const api = dialog.connect(state, send, normalizeProps)

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
                onClose={() => {
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
