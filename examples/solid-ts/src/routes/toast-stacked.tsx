import { Key, normalizeProps, useMachine } from "@zag-js/solid"
import * as toast from "@zag-js/toast"
import { createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { ToastItem } from "~/components/toast-item"

const toaster = toast.createStore({
  overlap: false,
  placement: "bottom",
})

export default function ToastGroup() {
  const service = useMachine(toast.group.machine, {
    id: createUniqueId(),
    gap: 24,
    store: toaster,
  })

  const api = createMemo(() => toast.group.connect(service, normalizeProps))
  let id: string | undefined

  return (
    <main>
      {/* <pre>{JSON.stringify(service.context.get("toasts"), null, 2)}</pre> */}

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
            id = toaster.create({
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
            if (!id) return
            toaster.update(id, {
              title: "Testing",
              type: "loading",
            })
          }}
        >
          Update Latest
        </button>
        <button
          class="toast-button"
          onClick={() => {
            const myPromise = new Promise<{ name: string }>((resolve) => {
              setTimeout(() => {
                resolve({ name: "Chakra" })
              }, 3000)
            })

            toaster.promise(myPromise, {
              loading: { title: "Creating toast..." },
              success: (data: { name: string }) => {
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
        <div {...api().getGroupProps()}>
          <Key each={api().getToasts()} by={(t) => t.id}>
            {(toast, index) => <ToastItem actor={toast} index={index} parent={service} />}
          </Key>
        </div>
      </Portal>
    </main>
  )
}
