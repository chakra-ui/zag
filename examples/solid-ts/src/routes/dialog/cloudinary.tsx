import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/dialog.css"

const WIDGET_SCRIPT = "https://upload-widget.cloudinary.com/global/all.js"

function getCloudinaryIframe() {
  return document.querySelector("[data-test=uw-iframe]")
}

function loadWidgetScript() {
  return new Promise<any>((resolve, reject) => {
    const win = window as any
    if (win.cloudinary) return resolve(win.cloudinary)
    let script = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_SCRIPT}"]`)
    if (!script) {
      script = document.createElement("script")
      script.src = WIDGET_SCRIPT
      script.async = true
      document.head.appendChild(script)
    }
    script.addEventListener("load", () => resolve(win.cloudinary))
    script.addEventListener("error", reject)
  })
}

export default function Page() {
  let buttonRef: HTMLButtonElement | undefined

  const service = useMachine(dialog.machine, {
    id: createUniqueId(),
    persistentElements: [getCloudinaryIframe],
  })

  const api = createMemo(() => dialog.connect(service, normalizeProps))

  const openWidget = async () => {
    const cloudinary = await loadWidgetScript()
    const widget = cloudinary.createUploadWidget(
      { cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME, uploadPreset: "ml_default" },
      (_error: unknown, result: any) => {
        if (result?.event === "close") buttonRef?.focus()
      },
    )
    widget.open()
  }

  return (
    <div>
      <button {...api().getTriggerProps()}>Open Dialog</button>
      <Show when={api().open}>
        <Portal>
          <div {...api().getBackdropProps()} />
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <h2 {...api().getTitleProps()}>Edit profile</h2>
              <p {...api().getDescriptionProps()}>Make changes to your profile here. Click save when you are done.</p>

              <button ref={buttonRef} onClick={openWidget}>
                Upload an Image
              </button>

              <button {...api().getCloseTriggerProps()}>
                <XIcon />
              </button>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}
