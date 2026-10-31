import { normalizeProps, useMachine } from "@zag-js/react"
import * as toast from "@zag-js/toast"
import { CircleCheck, CircleX, Info, LoaderCircle, TriangleAlert, XIcon } from "lucide-react"

const icons: Record<string, React.ElementType> = {
  success: CircleCheck,
  error: CircleX,
  warning: TriangleAlert,
  info: Info,
  loading: LoaderCircle,
}

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
  const Icon = icons[api.type]

  return (
    <div {...api.getRootProps()}>
      <span {...api.getGhostBeforeProps()} />
      <div data-scope="toast" data-part="progressbar" />
      {Icon && (
        <span data-scope="toast" data-part="indicator">
          <Icon />
        </span>
      )}
      <div {...api.getContentProps()}>
        {api.title && <div {...api.getTitleProps()}>{api.title}</div>}
        {api.description && <div {...api.getDescriptionProps()}>{api.description}</div>}
      </div>
      {actor.action && <button {...api.getActionTriggerProps()}>{actor.action.label}</button>}
      {api.closable && (
        <button {...api.getCloseTriggerProps()}>
          <XIcon />
        </button>
      )}
      <span {...api.getGhostAfterProps()} />
    </div>
  )
}
