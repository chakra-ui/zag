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

const toaster = toast.createStore({ placement: "bottom-end", overlap: false })

const messages = [
  { title: "Message sent", description: "Your message to Ada was delivered." },
  { title: "File uploaded" },
  { title: "Invite accepted", description: "Grace joined the design team and can now edit shared files." },
]

let count = 0

export default function Page() {
  const controls = useControls(toastControls)
  const service = useMachine(toast.group.machine, { id: useId(), store: toaster, ...controls.context })
  const api = toast.group.connect(service, normalizeProps)

  return (
    <>
      <main>
        <button onClick={() => toaster.create(messages[count++ % messages.length])}>Show toast</button>
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
