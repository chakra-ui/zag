import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { useId } from "react"

type TooltipProps = {
  controls: {}
}
export function Tooltip(props: TooltipProps) {
  const service = useMachine(tooltip.machine, {
    id: useId(),
    ...props.controls,
  })

  const api = tooltip.connect(service, normalizeProps)

  return (
    <>
      <button {...api.getTriggerProps()}>Hover me</button>
      <Portal>
        {api.open && (
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <div {...api.getArrowProps()}>
                <div {...api.getArrowTipProps()} />
              </div>
              Tooltip
            </div>
          </div>
        )}
      </Portal>
    </>
  )
}
