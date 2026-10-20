import { Key, normalizeProps, useMachine } from "@zag-js/solid"
import * as toast from "@zag-js/toast"
import { createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { ToastItem } from "~/components/toast-item"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end", duration: Infinity })

function saveDraft() {
  if (!toaster.isVisible("draft")) {
    toaster.create({ id: "draft", title: "Draft saved", description: "Saved 1 time.", meta: { saves: 1 } })
    return
  }

  toaster.update("draft", (prev) => {
    const saves = (prev.meta?.saves ?? 0) + 1
    return { description: `Saved ${saves} times.`, meta: { saves } }
  })
}

export default function Page() {
  const service = useMachine(toast.group.machine, { id: createUniqueId(), store: toaster })
  const api = createMemo(() => toast.group.connect(service, normalizeProps))

  return (
    <main>
      <div class="hstack">
        <button onClick={saveDraft}>Save draft</button>
        <button onClick={() => toaster.dismiss("draft")}>Dismiss</button>
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
