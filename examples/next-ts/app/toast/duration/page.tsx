"use client"

import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as toast from "@zag-js/toast"
import { useId } from "react"
import { ToastItem } from "@/components/toast-item"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end" })

export default function Page() {
  const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
  const api = toast.group.connect(service, normalizeProps)

  return (
    <main>
      <div className="hstack">
        <button onClick={() => toaster.create({ title: "Closes in 2 seconds", duration: 2000 })}>2 seconds</button>
        <button onClick={() => toaster.create({ title: "Closes in 10 seconds", duration: 10000 })}>10 seconds</button>
        <button onClick={() => toaster.create({ title: "Stays until dismissed", duration: Infinity })}>
          Persistent
        </button>
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
