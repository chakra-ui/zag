"use client"

import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as toast from "@zag-js/toast"
import { useId, useState } from "react"
import { ToastItem } from "@/components/toast-item"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end", duration: 10000 })
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function Page() {
  const [archived, setArchived] = useState(false)
  const [failUndo, setFailUndo] = useState(false)
  const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
  const api = toast.group.connect(service, normalizeProps)

  function archiveMessage() {
    setArchived(true)
    const fail = failUndo
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
      <p>{archived ? "Message archived" : "Message in inbox"}</p>
      <label>
        <input type="checkbox" checked={failUndo} onChange={(event) => setFailUndo(event.currentTarget.checked)} />
        Fail the undo
      </label>
      <button disabled={archived} onClick={archiveMessage}>
        Archive message
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
