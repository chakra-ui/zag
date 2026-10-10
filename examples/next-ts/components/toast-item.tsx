import { normalizeProps, useMachine } from "@zag-js/react"
import * as toast from "@zag-js/toast"
import { XIcon } from "lucide-react"

interface ToastItemProps {
  actor: toast.Options<React.ReactNode>
  index: number
  parent: toast.GroupService
}

export function ToastItem(props: ToastItemProps) {
  const { actor, index, parent } = props
  const composedProps = { ...actor, index, parent }

  const service = useMachine(toast.machine, composedProps)
  const api = toast.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <span {...api.getGhostBeforeProps()} />
      <div data-scope="toast" data-part="progressbar" />
      <div
        data-scope="toast"
        data-part="content"
        style={{ display: "grid", gap: "8px", width: "100%", paddingRight: "16px" }}
      >
        <div {...api.getTitleProps()}>
          {api.type === "loading" && "<...>"}
          {api.title}
        </div>
        <div {...api.getDescriptionProps()}>{api.description}</div>
        {actor.action && <button {...api.getActionTriggerProps()}>{actor.action.label}</button>}
        <button {...api.getCloseTriggerProps()}>
          <XIcon />
        </button>
      </div>
      <span {...api.getGhostAfterProps()} />
    </div>
  )
}
