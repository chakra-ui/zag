import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/preact"
import { XIcon } from "lucide-preact"
import { useEffect, useId, useRef } from "react"

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: { cloudName: string; uploadPreset: string },
        callback: (error: unknown, result: { event: string }) => void,
      ) => { open: () => void }
    }
  }
}

function getCloudinaryIframe() {
  return document.querySelector("[data-test=uw-iframe]")
}

export default function Page() {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const widgetRef = useRef<{ open: () => void } | null>(null)

  const service = useMachine(dialog.machine, {
    id: useId(),
    persistentElements: [getCloudinaryIframe],
  })

  const api = dialog.connect(service, normalizeProps)

  useEffect(() => {
    if (!window.cloudinary) return
    widgetRef.current = window.cloudinary.createUploadWidget(
      { cloudName: "demo", uploadPreset: "ml_default" },
      () => {},
    )
  }, [])

  return (
    <div>
      <button {...api.getTriggerProps()}>Open Dialog</button>
      {api.open && (
        <Portal>
          <div {...api.getBackdropProps()} />
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <h2 {...api.getTitleProps()}>Edit profile</h2>
              <p {...api.getDescriptionProps()}>Make changes to your profile here. Click save when you are done.</p>

              <button
                ref={buttonRef}
                onClick={() => {
                  widgetRef.current?.open()
                  buttonRef.current?.focus()
                }}
              >
                Upload an Image
              </button>

              <button {...api.getCloseTriggerProps()}>
                <XIcon />
              </button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
