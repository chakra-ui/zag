import { Key, normalizeProps, useMachine } from "@zag-js/solid"
import * as toast from "@zag-js/toast"
import { createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { ToastItem } from "~/components/toast-item"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end" })

export default function Page() {
  const service = useMachine(toast.group.machine, { id: createUniqueId(), store: toaster })
  const api = createMemo(() => toast.group.connect(service, normalizeProps))

  return (
    <main>
      <div class="hstack">
        <button onClick={() => toaster.create({ title: "Sync complete", description: "All 24 files are up to date." })}>
          Show toast
        </button>
        <button onClick={() => toaster.pause()}>Pause all</button>
        <button onClick={() => toaster.resume()}>Resume all</button>
        <button onClick={() => toaster.dismiss()}>Dismiss all</button>
      </div>
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
