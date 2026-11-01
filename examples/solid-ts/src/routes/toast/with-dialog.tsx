import * as dialog from "@zag-js/dialog"
import { Key, normalizeProps, useMachine } from "@zag-js/solid"
import * as toast from "@zag-js/toast"
import { XIcon } from "lucide-solid"
import { createMemo, createUniqueId, Show } from "solid-js"
import { Portal } from "solid-js/web"
import { ToastItem } from "~/components/toast-item"
import "@styles/dialog.css"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end", duration: Infinity })

export default function Page() {
  const dialogService = useMachine(dialog.machine, { id: createUniqueId() })
  const dialogApi = createMemo(() => dialog.connect(dialogService, normalizeProps))

  const service = useMachine(toast.group.machine, { id: createUniqueId(), store: toaster })
  const api = createMemo(() => toast.group.connect(service, normalizeProps))

  return (
    <main>
      <button {...dialogApi().getTriggerProps()}>Edit profile</button>
      <Show when={dialogApi().open}>
        <Portal>
          <div {...dialogApi().getBackdropProps()} />
          <div {...dialogApi().getPositionerProps()}>
            <div {...dialogApi().getContentProps()}>
              <h2 {...dialogApi().getTitleProps()}>Edit profile</h2>
              <p {...dialogApi().getDescriptionProps()}>Saving shows a toast while the dialog stays open.</p>
              <button onClick={() => toaster.success({ title: "Profile saved" })}>Save</button>
              <button {...dialogApi().getCloseTriggerProps()}>
                <XIcon />
              </button>
            </div>
          </div>
        </Portal>
      </Show>
      <Portal>
        <div {...api().getGroupProps()}>
          <Key each={api().getToasts()} by={(actor) => actor.id}>
            {(actor, index) => <ToastItem actor={actor} index={index} parent={service} />}
          </Key>
        </div>
      </Portal>
    </main>
  )
}
