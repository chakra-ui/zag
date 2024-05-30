import { Portal, normalizeProps, useActor, useMachine } from "@zag-js/react"
import * as toast from "@zag-js/toast"
import { useId, useRef } from "react"
import { HiX } from "react-icons/hi"

function Toast({ actor }: { actor: toast.Service }) {
  const [state, send] = useActor(actor)
  const api = toast.connect(state, send, normalizeProps)
  return (
    <div {...api.getRootProps()}>
      <span {...api.getGhostBeforeProps()} />
      <p {...api.getTitleProps()}>
        [{api.type}] {api.title}
      </p>
      <button {...api.getCloseTriggerProps()}>
        <HiX />
      </button>
      <span {...api.getGhostAfterProps()} />
    </div>
  )
}

export function ToastGroup(props: any) {
  const [state, send] = useMachine(
    toast.group.machine({
      id: useId(),
      overlap: true,
      offsets: "24px",
      placement: "bottom-end",
      removeDelay: 200,
    }),
    { context: props.controls },
  )

  const api = toast.group.connect(state, send, normalizeProps)
  const id = useRef<string>()

  return (
    <>
      <div className="toast__trigger-group">
        <button
          className="toast__trigger"
          onClick={() => {
            id.current = api.create({
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
            api.update(id.current, {
              title: "The Evil Rabbit is eating...",
              type: "success",
            })
          }}
        >
          Update
        </button>
      </div>

      <Portal>
        {api.getPlacements().map((placement) => (
          <div
            key={placement}
            {...api.getGroupProps({ placement: placement as any })}
          >
            {api.getToastsByPlacement(placement).map((toast) => (
              <Toast key={toast.id} actor={toast} />
            ))}
          </div>
        ))}
      </Portal>
    </>
  )
}
