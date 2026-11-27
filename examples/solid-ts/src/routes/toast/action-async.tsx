import { Key, normalizeProps, useMachine } from "@zag-js/solid"
import * as toast from "@zag-js/toast"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "@solidjs/web"
import { ToastItem } from "~/components/toast-item"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end", duration: 10000 })
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function Page() {
  const [archived, setArchived] = createSignal(false)
  const [failUndo, setFailUndo] = createSignal(false)
  const service = useMachine(toast.group.machine, { id: createUniqueId(), store: toaster })
  const api = createMemo(() => toast.group.connect(service, normalizeProps))

  function archiveMessage() {
    setArchived(true)
    const fail = failUndo()
    let undoing = false
    const id = toaster.create({
      title: "Message archived",
      action: {
        label: "Undo",
        onClick(event) {
          // keep the toast open while the undo runs
          event.preventDefault()
          if (undoing) return
          undoing = true
          toaster.pause(id)
          toaster.update(id, { title: "Undoing…" })
          wait(800).then(() => {
            undoing = false
            if (fail) {
              toaster.update(id, { title: "Couldn't undo. Try again." })
              toaster.resume(id)
              return
            }
            setArchived(false)
            toaster.dismiss(id)
          })
        },
      },
    })
  }

  return (
    <main>
      <p>{archived() ? "Message archived" : "Message in inbox"}</p>
      <label>
        <input type="checkbox" checked={failUndo()} onChange={(event) => setFailUndo(event.currentTarget.checked)} />
        Fail the undo
      </label>
      <button disabled={archived()} onClick={archiveMessage}>
        Archive message
      </button>
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
