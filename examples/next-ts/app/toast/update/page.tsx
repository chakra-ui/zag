"use client"

import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as toast from "@zag-js/toast"
import { useId } from "react"
import { ToastItem } from "@/components/toast-item"
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
  const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
  const api = toast.group.connect(service, normalizeProps)

  return (
    <main>
      <div className="hstack">
        <button onClick={saveDraft}>Save draft</button>
        <button onClick={() => toaster.dismiss("draft")}>Dismiss</button>
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
