import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { cloneElement, isValidElement, useId } from "react"

interface Props extends Omit<tooltip.Context, "id" | "__controlled"> {
  defaultOpen?: boolean
  children: React.ReactNode
  label: React.ReactNode
}

export function Tooltip(props: Props) {
  const { defaultOpen, label, open, children, ...rest } = props

  const [state, send] = useMachine(
    tooltip.machine({
      id: useId(),
      open: open ?? defaultOpen,
    }),
    {
      context: {
        ...rest,
        open: open ?? defaultOpen,
        __controlled: open !== undefined,
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
      {api.isOpen && (
        <Portal>
          <div {...api.positionerProps}>
            <div {...api.contentProps}>{label}</div>
          </div>
        </Portal>
      )}
    </main>
  )
}
