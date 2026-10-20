import { normalizeProps, Portal, useMachine } from "@zag-js/preact"
import * as toast from "@zag-js/toast"
import { useId } from "react"
import { ToastItem } from "../../components/toast-item"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end" })

export default function Page() {
  const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
  const api = toast.group.connect(service, normalizeProps)

  return (
    <main>
      <div className="hstack">
        <button onClick={() => toaster.create({ title: "Sync complete", description: "All 24 files are up to date." })}>
          Show toast
        </button>
        <button onClick={() => toaster.pause()}>Pause all</button>
        <button onClick={() => toaster.resume()}>Resume all</button>
        <button onClick={() => toaster.dismiss()}>Dismiss all</button>
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
