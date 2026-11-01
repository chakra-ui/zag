"use client"

import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as toast from "@zag-js/toast"
import { useId, useState } from "react"
import { ToastItem } from "@/components/toast-item"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end", max: 2, duration: Infinity })

function updateWaiting() {
  for (let i = 0; i < 2; i++) {
    toaster.update("waiting", (prev) => {
      const updates = (prev.meta?.updates ?? 0) + 1
      return { title: `Toast 3 (updated ${updates} times)`, meta: { updates } }
    })
  }
}

function dismissOldest() {
  const oldest = toaster.getVisibleToasts().at(-1)
  if (oldest?.id) toaster.dismiss(oldest.id)
}

export default function Page() {
  const [started, setStarted] = useState(false)
  const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
  const api = toast.group.connect(service, normalizeProps)

  function start() {
    toaster.create({ id: "first", title: "Toast 1" })
    toaster.create({ id: "second", title: "Toast 2" })
    toaster.create({ id: "waiting", title: "Toast 3", description: "Waited for a free slot.", meta: { updates: 0 } })
    setStarted(true)
  }

  function reset() {
    toaster.remove()
    setStarted(false)
  }

  return (
    <main>
      <div className="hstack">
        <button disabled={started} onClick={start}>
          Create three toasts
        </button>
        <button disabled={!started} onClick={updateWaiting}>
          Update waiting toast
        </button>
        <button disabled={!started} onClick={() => toaster.dismiss("waiting")}>
          Dismiss waiting toast
        </button>
        <button disabled={!started} onClick={dismissOldest}>
          Dismiss oldest
        </button>
        <button onClick={reset}>Reset</button>
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
