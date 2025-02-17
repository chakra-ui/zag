import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as toast from "@zag-js/toast"
import { XIcon } from "lucide-react"
import { useId, useRef } from "react"

interface ToastProps {
  actor: toast.Options<React.ReactNode>
  index: number
  parent: toast.GroupService
}

function Toast(props: ToastProps) {
  const { actor, index, parent } = props
  const composedProps = { ...actor, index, parent }

  const service = useMachine(toast.machine, composedProps)
  const api = toast.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <span {...api.getGhostBeforeProps()} />
      <div data-scope="toast" data-part="progressbar" />
      <div {...api.getTitleProps()}>
        {api.type === "loading" && "<...>"}
        {api.title} {api.type}
      </div>
      <div {...api.getDescriptionProps()}>{api.description}</div>
      <button {...api.getCloseTriggerProps()}>
        <XIcon />
      </button>
      <span {...api.getGhostAfterProps()} />
    </div>
  )
}

const toaster = toast.createStore({
  overlap: false,
  placement: "bottom",
})

export default function ToastGroup() {
  const service = useMachine(toast.group.machine, {
    id: useId(),
    gap: 24,
    store: toaster,
  })

  const api = toast.group.connect(service, normalizeProps)
  const id = useRef<string>()

  return (
    <main>
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
            <Toast key={toast.id} actor={toast} index={index} parent={service} />
          ))}
        </div>
      </Portal>
    </main>
  )
}
