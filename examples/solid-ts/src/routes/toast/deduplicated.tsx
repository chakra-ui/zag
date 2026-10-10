import { Key, normalizeProps, useMachine } from "@zag-js/solid"
import * as toast from "@zag-js/toast"
import { createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { ToastItem } from "~/components/toast-item"

export default function DeduplicatedToasts() {
  const toaster = toast.createStore<string>({ placement: "bottom-end", overlap: false, duration: Infinity })
  const service = useMachine(toast.group.machine, { id: createUniqueId(), store: toaster })
  const api = createMemo(() => toast.group.connect(service, normalizeProps))

  function saveDraft() {
    if (!toaster.isVisible("draft")) {
      toaster.create({ id: "draft", title: "Draft saved", description: "Saved 1 time.", meta: { saves: 1 } })
      return
    }

    toaster.update("draft", (prev) => {
      const saves = (prev.meta?.saves ?? 0) + 1

      return {
        description: `Saved ${saves} times.`,
        meta: { saves },
      }
    })
  }

  return (
    <main style={{ display: "grid", "align-content": "start", gap: "24px", "max-width": "640px" }}>
      <h1>Deduplicated toasts</h1>
      <p>Repeated saves update one persistent toast. Close it, then save again to start a new count.</p>
      <div style={{ display: "flex", "flex-wrap": "wrap", gap: "8px" }}>
        <button onClick={saveDraft}>Save draft</button>
        <button onClick={() => toaster.dismiss("draft")}>Dismiss draft</button>
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
