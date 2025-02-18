import { normalizeProps, useMachine } from "@zag-js/solid"
import * as toast from "@zag-js/toast"
import { XIcon } from "lucide-solid"
import { Accessor, createMemo } from "solid-js"

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
