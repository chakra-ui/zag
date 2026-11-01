import * as dialog from "@zag-js/dialog"
import { normalizeProps, Portal, useMachine } from "@zag-js/preact"
import * as toast from "@zag-js/toast"
import { XIcon } from "lucide-preact"
import { useId } from "react"
import { ToastItem } from "../../components/toast-item"
import "@styles/dialog.css"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end", duration: Infinity })

export default function Page() {
  const dialogService = useMachine(dialog.machine, { id: useId() })
  const dialogApi = dialog.connect(dialogService, normalizeProps)

  const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
  const api = toast.group.connect(service, normalizeProps)

  return (
    <main>
      <button {...dialogApi.getTriggerProps()}>Edit profile</button>
      {dialogApi.open && (
        <Portal>
          <div {...dialogApi.getBackdropProps()} />
          <div {...dialogApi.getPositionerProps()}>
            <div {...dialogApi.getContentProps()}>
              <h2 {...dialogApi.getTitleProps()}>Edit profile</h2>
              <p {...dialogApi.getDescriptionProps()}>Saving shows a toast while the dialog stays open.</p>
              <button onClick={() => toaster.success({ title: "Profile saved" })}>Save</button>
              <button {...dialogApi.getCloseTriggerProps()}>
                <XIcon />
              </button>
            </div>
          </div>
        </Portal>
      )}
      <Portal>
        <div {...api.getGroupProps()}>
          {api.getToasts().map((actor, index) => (
            <ToastItem key={actor.id} actor={actor} index={index} parent={service} />
          ))}
        </div>
      </Portal>
    </main>
  )
}
