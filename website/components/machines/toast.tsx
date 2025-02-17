import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as toast from "@zag-js/toast"
import { useId, useRef } from "react"
import { HiX } from "react-icons/hi"

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
        {api.type === "loading" && "<...>"}[{api.type}] {api.title}
      </div>
      <div {...api.getDescriptionProps()}>{api.description}</div>
      <button {...api.getCloseTriggerProps()}>
        <HiX />
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
    store: toaster,
    gap: 24,
  })

  const api = toast.group.connect(service, normalizeProps)
  const id = useRef<string>()

  return (
    <>
      <div className="toast__trigger-group">
        <button
          className="toast__trigger"
          onClick={() => {
            id.current = toaster.create({
              title: "The Evil Rabbit jumped over the fence.",
              type: "info",
            })
          }}
        >
          Show toast
        </button>

        <button
          className="toast__trigger"
          onClick={() => {
            if (!id.current) return
            toaster.update(id.current, {
              title: "The Evil Rabbit is eating...",
              type: "success",
            })
          }}
        >
          Update
        </button>
      </div>

      <Portal>
        <div {...api.getGroupProps()}>
          {api.getToasts().map((toast, index) => (
            <Toast
              key={toast.id}
              actor={toast}
              index={index}
              parent={service}
            />
          ))}
        </div>
      </Portal>
    </>
  )
}
