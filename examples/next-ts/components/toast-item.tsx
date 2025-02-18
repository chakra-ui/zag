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
