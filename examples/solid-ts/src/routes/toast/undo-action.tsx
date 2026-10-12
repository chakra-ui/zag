import { Key, normalizeProps, useMachine } from "@zag-js/solid"
import * as toast from "@zag-js/toast"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { ToastItem } from "~/components/toast-item"

export default function UndoAction() {
  const toaster = toast.createStore<string>({ placement: "bottom-end", duration: 10000 })
  const [saved, setSaved] = createSignal(true)
  const service = useMachine(toast.group.machine, { id: createUniqueId(), store: toaster })
  const api = createMemo(() => toast.group.connect(service, normalizeProps))

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
    <main style={{ display: "grid", "align-content": "start", gap: "24px", "max-width": "640px" }}>
      <h1>Undo action</h1>
      <p>Remove a bookmark, then use Undo in the notification to restore it.</p>
      <section>
        <h2>Designing accessible notifications</h2>
        <p role="status">{saved() ? "Saved to reading list" : "Removed from reading list"}</p>
        <button disabled={!saved()} onClick={removeBookmark}>
          Remove bookmark
        </button>
      </section>
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
