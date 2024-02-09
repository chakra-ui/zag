import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/react"
import { cloneElement, isValidElement, useId } from "react"

interface Props extends Omit<collapsible.Context, "id" | "__controlled"> {
  defaultOpen?: boolean
  trigger?: React.ReactNode
  children: React.ReactNode
}

export function Collapsible(props: Props) {
  const { trigger, children, open, defaultOpen, ...context } = props

  const [state, send] = useMachine(
    collapsible.machine({
      id: useId(),
      open: open ?? defaultOpen,
      __controlled: open !== undefined,
    }),
    {
      context: {
        ...context,
        open,
      },
    },
  )

  const api = collapsible.connect(state, send, normalizeProps)

  return (
    <div {...api.rootProps}>
      {isValidElement(trigger) ? cloneElement(trigger, api.triggerProps) : null}
      <div {...api.contentProps}>{children}</div>
    </div>
  )
}
