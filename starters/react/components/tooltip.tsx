import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { cloneElement, isValidElement, useId } from "react"

interface Props extends Omit<tooltip.Context, "id" | "open.controlled"> {
  defaultOpen?: boolean
  children: React.ReactNode
  label: React.ReactNode
}

export function Tooltip(props: Props) {
  const { defaultOpen, label, open, children, ...context } = props

  const [state, send] = useMachine(
    tooltip.machine({
      id: useId(),
      open: open ?? defaultOpen,
    }),
    {
      context: {
        ...context,
        "open.controlled": open !== undefined,
        open,
      },
    },
  )

  const api = tooltip.connect(state, send, normalizeProps)

  return (
    <main className="tooltip">
      {isValidElement(children) ? (
        cloneElement(children, api.triggerProps)
      ) : (
        <span {...api.triggerProps}>{children}</span>
      )}
      {api.open && (
        <Portal>
          <div {...api.positionerProps}>
            <div {...api.contentProps}>{label}</div>
          </div>
        </Portal>
      )}
    </main>
  )
}
