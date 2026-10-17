import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as toast from "@zag-js/toast"
import { useId, useState } from "react"
import { ToastItem } from "../../components/toast-item"

export default function DeduplicatedToasts() {
  const [toaster] = useState(() =>
    toast.createStore<string>({ placement: "bottom-end", overlap: false, duration: Infinity }),
  )
  const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
  const api = toast.group.connect(service, normalizeProps)

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
    <main style={{ display: "grid", alignContent: "start", gap: "24px", maxWidth: "640px" }}>
      <h1>Deduplicated toasts</h1>
      <p>Repeated saves update one persistent toast. Close it, then save again to start a new count.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        <button onClick={saveDraft}>Save draft</button>
        <button onClick={() => toaster.dismiss("draft")}>Dismiss draft</button>
      </div>
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
