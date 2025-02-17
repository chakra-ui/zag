import { Key, normalizeProps, useMachine } from "@zag-js/solid"
import * as toast from "@zag-js/toast"
import { XIcon } from "lucide-solid"
import { Accessor, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"

interface ToastProps {
  actor: Accessor<toast.Options<any>>
  index: Accessor<number>
  parent: toast.GroupService
}

function Toast(props: ToastProps) {
  const computedProps = createMemo(() => ({
    ...props.actor(),
    index: props.index(),
    parent: props.parent,
  }))

  const service = useMachine(toast.machine, computedProps)
  const api = createMemo(() => toast.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <pre>{JSON.stringify(service.state.get(), null, 2)}</pre>
      <span {...api().getGhostBeforeProps()} />
      <div data-scope="toast" data-part="progressbar" />
      <div {...api().getTitleProps()}>
        {api().type === "loading" && "<...>"}
        {api().title}
      </div>
      <div {...api().getDescriptionProps()}>{api().description}</div>
      <button {...api().getCloseTriggerProps()}>
        <XIcon />{" "}
      </button>
      <span {...api().getGhostAfterProps()} />
    </div>
  )
}

const toaster = toast.createStore({
  overlap: false,
  placement: "bottom",
})

export default function ToastGroup() {
  const service = useMachine(toast.group.machine, {
    id: createUniqueId(),
    gap: 24,
    store: toaster,
    // gap?, offsets?, (id, dir, getRootNode), removeDelay
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
            {(toast, index) => <Toast actor={toast} index={index} parent={service} />}
          </Key>
        </div>
      </Portal>
    </main>
  )
}
