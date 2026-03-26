import styles from "../../../../shared/src/css/dialog.module.css"
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

  const service = useMachine(dialog.machine, {
    id: useId(),
    persistentElements: [getCloudinaryIframe],
  })

  const api = dialog.connect(service, normalizeProps)

  return (
    <div>
      <button {...api.getTriggerProps()}>Open Dialog</button>
      {api.open && (
        <Portal>
          <div {...api.getBackdropProps()} className={styles.Backdrop} />
          <div {...api.getPositionerProps()} className={styles.Positioner}>
            <div {...api.getContentProps()} className={styles.Content}>
              <h2 {...api.getTitleProps()} className={styles.Title}>Edit profile</h2>
              <p {...api.getDescriptionProps()} className={styles.Description}>Make changes to your profile here. Click save when you are done.</p>

              <CldUploadWidget
                uploadPreset="ml_default"
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

              <button {...api.getCloseTriggerProps()} className={styles.CloseTrigger}>
                <XIcon />
              </button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
