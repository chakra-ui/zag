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
        <button onClick={() => toaster.create({ title: "Closes in 2 seconds", duration: 2000 })}>2 seconds</button>
        <button onClick={() => toaster.create({ title: "Closes in 10 seconds", duration: 10000 })}>10 seconds</button>
        <button onClick={() => toaster.create({ title: "Stays until dismissed", duration: Infinity })}>
          Persistent
        </button>
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
