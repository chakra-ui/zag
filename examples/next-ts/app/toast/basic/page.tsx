"use client"

import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { toastControls } from "@zag-js/shared"
import * as toast from "@zag-js/toast"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { ToastItem } from "@/components/toast-item"
import { Toolbar } from "@/components/toolbar"
import { useControls } from "@/hooks/use-controls"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end" })

export default function Page() {
  const controls = useControls(toastControls)
  const service = useMachine(toast.group.machine, { id: useId(), store: toaster, ...controls.context })
  const api = toast.group.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="hstack">
          <button
            onClick={() => toaster.create({ title: "Event created", description: "Sunday, December 3 at 9:00 AM" })}
          >
            Show toast
          </button>
          <button onClick={() => toaster.success({ title: "Changes saved" })}>Success</button>
          <button
            onClick={() => toaster.error({ title: "Couldn't save changes", description: "Check your connection." })}
          >
            Error
          </button>
          <button onClick={() => toaster.warning({ title: "Storage almost full", description: "90% of 5 GB used." })}>
            Warning
          </button>
          <button onClick={() => toaster.info({ title: "A new version is available" })}>Info</button>
          <button onClick={() => toaster.loading({ title: "Uploading files…" })}>Loading</button>
        </div>
        <Portal>
          <div {...api.getGroupProps()}>
            {api.getToasts().map((actor, index) => (
              <ToastItem key={actor.id} actor={actor} index={index} parent={service} />
            ))}
          </div>
        </Portal>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
