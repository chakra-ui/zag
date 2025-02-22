import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { toastControls } from "@zag-js/shared"
import * as toast from "@zag-js/toast"
import { useId, useRef } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"
import { ToastItem } from "../components/toast-item"
import { Dialog } from "../components/dialog"

const toaster = toast.createStore({
  overlap: true,
  placement: "bottom",
  gap: 24,
})

export default function ToastGroup() {
  const controls = useControls(toastControls)

  const service = useMachine(toast.group.machine, {
    id: useId(),
    store: toaster,
    ...controls.context,
  })

  const api = toast.group.connect(service, normalizeProps)
  const id = useRef<string>()

  return (
    <>
      <main>
        <Dialog />
        <div style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={() => {
              toaster.create({
                title: "Fetching data...",
                type: "loading",
              })
            }}
          >
            Notify (Loading)
          </button>
          <button
            onClick={() => {
              id.current = toaster.create({
                title: "Ooops! Something was wrong",
                type: "error",
                onStatusChange(details) {
                  console.log(details)
                },
                // duration: Infinity,
              })
            }}
          >
            Notify (Error)
          </button>
          <button
            onClick={() => {
              if (!id.current) return
              toaster.update(id.current, {
                title: "Testing",
                type: "loading",
              })
            }}
          >
            Update Latest
          </button>
          <button
            className="toast-button"
            onClick={() => {
              const promise = new Promise<{ name: string }>((resolve) => {
                setTimeout(() => {
                  resolve({ name: "Chakra" })
                }, 3000)
              })

              toaster.promise(promise, {
                loading: { title: "Creating toast..." },
                success: (data) => {
                  return { title: `${data.name} toast added` }
                },
                error: { title: "Error" },
              })
            }}
          >
            Promise
          </button>
          <button
            onClick={() => {
              toaster.create({
                type: "info",
                title: <h1 style={{ color: "red" }}>Hello</h1>,
                description: <p>This is a description</p>,
              })
            }}
          >
            Create (JSX)
          </button>

          <button onClick={() => toaster.dismiss()}>Close all</button>
          <button onClick={() => toaster.pause()}>Pause all</button>
          <button onClick={() => toaster.resume()}>Resume all</button>
        </div>

        <Portal>
          <div {...api.getGroupProps()}>
            {api.getToasts().map((toast, index) => (
              <ToastItem key={toast.id} actor={toast} index={index} parent={service} />
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
