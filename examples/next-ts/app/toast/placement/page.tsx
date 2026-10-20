"use client"

import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as toast from "@zag-js/toast"
import { useId } from "react"
import { ToastItem } from "@/components/toast-item"
import "@styles/toast.css"

const placements: toast.Placement[] = ["top-start", "top", "top-end", "bottom-start", "bottom", "bottom-end"]

const toasters = new Map(placements.map((placement) => [placement, toast.createStore({ placement })]))

function Toaster(props: { store: toast.Store }) {
  const service = useMachine(toast.group.machine, { id: useId(), store: props.store })
  const api = toast.group.connect(service, normalizeProps)

  return (
    <Portal>
      <div {...api.getGroupProps()}>
        {api.getToasts().map((actor, index) => (
          <ToastItem key={actor.id} actor={actor} index={index} parent={service} />
        ))}
      </div>
    </Portal>
  )
}

export default function Page() {
  return (
    <main>
      <div className="hstack">
        {placements.map((placement) => (
          <button key={placement} onClick={() => toasters.get(placement)!.create({ title: `Toast at ${placement}` })}>
            {placement}
          </button>
        ))}
      </div>
      {placements.map((placement) => (
        <Toaster key={placement} store={toasters.get(placement)!} />
      ))}
    </main>
  )
}
