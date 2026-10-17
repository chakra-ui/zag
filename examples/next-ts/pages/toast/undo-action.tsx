import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as toast from "@zag-js/toast"
import { useId, useState } from "react"
import { ToastItem } from "../../components/toast-item"

export default function UndoAction() {
  const [toaster] = useState(() => toast.createStore<string>({ placement: "bottom-end", duration: 10000 }))
  const [saved, setSaved] = useState(true)
  const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
  const api = toast.group.connect(service, normalizeProps)

  function removeBookmark() {
    setSaved(false)
    toaster.create({
      title: "Bookmark removed",
      description: "Undo to put it back in your reading list.",
      action: {
        label: "Undo",
        onClick() {
          setSaved(true)
          toaster.create({ title: "Bookmark restored", type: "success" })
        },
      },
    })
  }

  return (
    <main style={{ display: "grid", alignContent: "start", gap: "24px", maxWidth: "640px" }}>
      <h1>Undo action</h1>
      <p>Remove a bookmark, then use Undo in the notification to restore it.</p>
      <section>
        <h2>Designing accessible notifications</h2>
        <p role="status">{saved ? "Saved to reading list" : "Removed from reading list"}</p>
        <button disabled={!saved} onClick={removeBookmark}>
          Remove bookmark
        </button>
      </section>
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
