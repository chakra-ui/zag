import { normalizeProps, Portal, useMachine } from "@zag-js/preact"
import * as toast from "@zag-js/toast"
import { useId, useState } from "react"
import { ToastItem } from "../../components/toast-item"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end", duration: 10000 })

export default function Page() {
  const [saved, setSaved] = useState(true)
  const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
  const api = toast.group.connect(service, normalizeProps)

  function removeBookmark() {
    setSaved(false)
    toaster.create({
      title: "Bookmark removed",
      action: {
        label: "Undo",
        onClick: () => setSaved(true),
      },
    })
  }

  return (
    <main>
      <p>{saved ? "Saved to reading list" : "Removed from reading list"}</p>
      <button disabled={!saved} onClick={removeBookmark}>
        Remove bookmark
      </button>
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
