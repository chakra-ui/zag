import { normalizeProps, useMachine } from "@zag-js/solid"
import * as toast from "@zag-js/toast"
import { CircleCheck, CircleX, Info, LoaderCircle, TriangleAlert, XIcon } from "lucide-solid"
import { Accessor, Component, createMemo, Show } from "solid-js"
import { Dynamic } from "solid-js/web"

const icons: Record<string, Component> = {
  success: CircleCheck,
  error: CircleX,
  warning: TriangleAlert,
  info: Info,
  loading: LoaderCircle,
}

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
      <Show when={icons[api().type]}>
        {(Icon) => (
          <span data-scope="toast" data-part="indicator">
            <Dynamic component={Icon()} />
          </span>
        )}
      </Show>
      <div {...api().getContentProps()}>
        <Show when={api().title}>
          <div {...api().getTitleProps()}>{api().title}</div>
        </Show>
        <Show when={api().description}>
          <div {...api().getDescriptionProps()}>{api().description}</div>
        </Show>
      </div>
      <Show when={props.actor().action}>
        {(action) => <button {...api().getActionTriggerProps()}>{action().label}</button>}
      </Show>
      <Show when={api().closable}>
        <button {...api().getCloseTriggerProps()}>
          <XIcon />
        </button>
      </Show>
      <span {...api().getGhostAfterProps()} />
    </div>
  )
}
