import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { cloneElement, isValidElement, useId } from "react"

interface Props extends Omit<tooltip.Props, "id"> {
  children: React.ReactNode
  label: React.ReactNode
}

export function Tooltip(props: Props) {
  const { label, children, ...rest } = props

  const service = useMachine(tooltip.machine, {
    id: useId(),
    ...rest,
  })

  const api = tooltip.connect(service, normalizeProps)

  return (
    <main className="tooltip">
      {isValidElement(children) ? (
        cloneElement(children, api.getTriggerProps())
      ) : (
        <span {...api.getTriggerProps()}>{children}</span>
      )}
      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>{label}</div>
          </div>
        </Portal>
      )}
    </main>
  )
}
