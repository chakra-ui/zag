import { normalizeProps, useMachine } from "@zag-js/solid"
import * as toast from "@zag-js/toast"
import { XIcon } from "lucide-solid"
import { Accessor, createMemo, Show } from "solid-js"

interface ToastItemProps {
  actor: Accessor<toast.Options<any>>
  index: Accessor<number>
  parent: toast.GroupService
}

export function ToastItem(props: ToastItemProps) {
  const computedProps = createMemo(() => ({
    ...props.actor(),
    index: props.index(),
    parent: props.parent,
  }))

  const service = useMachine(toast.machine, computedProps)
  const api = createMemo(() => toast.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <span {...api().getGhostBeforeProps()} />
      <div data-scope="toast" data-part="progressbar" />
      <div
        data-scope="toast"
        data-part="content"
        style={{ display: "grid", gap: "8px", width: "100%", "padding-right": "16px" }}
      >
        <div {...api().getTitleProps()}>
          {api().type === "loading" && "<...>"}
          {api().title}
        </div>
        <div {...api().getDescriptionProps()}>{api().description}</div>
        <Show when={props.actor().action}>
          {(action) => <button {...api().getActionTriggerProps()}>{action().label}</button>}
        </Show>
        <button {...api().getCloseTriggerProps()}>
          <XIcon />{" "}
        </button>
      </div>
      <span {...api().getGhostAfterProps()} />
    </div>
  )
}
