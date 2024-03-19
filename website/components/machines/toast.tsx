import { normalizeProps, useActor, useMachine } from "@zag-js/react"
import * as toast from "@zag-js/toast"
import { useId, useRef } from "react"
import { HiX } from "react-icons/hi"

function Toast({ actor }: { actor: toast.Service }) {
  const [state, send] = useActor(actor)
  const api = toast.connect(state, send, normalizeProps)
  return (
    <div {...api.rootProps}>
      <p {...api.titleProps}>
        [{api.type}] {api.title}
      </p>

      <button {...api.closeTriggerProps}>
        <HiX />
      </button>
    </div>
  )
}

export function ToastGroup(props: any) {
  const [state, send] = useMachine(
    toast.group.machine({
      id: useId(),
      offsets: "24px",
    }),
    { context: props.controls },
  )

  const api = toast.group.connect(state, send, normalizeProps)
  const id = useRef<string>()

  return (
    <>
      <div {...api.getGroupProps({ placement: "bottom-end" })}>
        {api.toasts.map((actor) => (
          <Toast key={actor.id} actor={actor} />
        ))}
      </div>

      <div>
        <button
          onClick={() => {
            id.current = api.create({
              title: "The Evil Rabbit jumped over the fence.",
              type: "info",
              removeDelay: 500,
            })
          }}
        >
          Show toast
        </button>

        <button
          onClick={() => {
            if (!id.current) return
            api.update(id.current, {
              title: "The Evil Rabbit is eating...",
              type: "success",
            })
          }}
        >
          Update
        </button>
      </div>
    </>
  )
}
