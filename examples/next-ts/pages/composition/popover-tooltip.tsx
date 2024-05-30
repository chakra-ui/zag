import * as popover from "@zag-js/popover"
import { mergeProps, normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { useId } from "react"

export default function Page() {
  const ids = { trigger: useId() }

  const [popoverState, popoverSend] = useMachine(
    popover.machine({
      id: useId(),
      ids,
    }),
  )

  const [tooltipState, tooltipSend] = useMachine(
    tooltip.machine({
      id: useId(),
      ids,
      positioning: { placement: "top" },
    }),
  )

  const popoverApi = popover.connect(popoverState, popoverSend, normalizeProps)
  const tooltipApi = tooltip.connect(tooltipState, tooltipSend, normalizeProps)

  return (
    <main className="popover">
      <div data-part="root">
        <button {...mergeProps(popoverApi.getTriggerProps(), tooltipApi.getTriggerProps())}>Click me</button>

        {tooltipApi.open && (
          <div {...tooltipApi.getPositionerProps()}>
            <div className="tooltip-content" {...tooltipApi.getContentProps()}>
              Tooltip
            </div>
          </div>
        )}

        <Portal>
          <div {...popoverApi.getPositionerProps()}>
            <div {...popoverApi.getContentProps()}>
              <div {...popoverApi.getTitleProps()}>Popover Title</div>
              <div data-part="body" data-testid="popover-body">
                <a>Non-focusable Link</a>
                <a href="#" data-testid="focusable-link">
                  Focusable Link
                </a>
                <input placeholder="input" />
                <button {...popoverApi.getCloseTriggerProps()}>X</button>
              </div>
            </div>
          </div>
        </Portal>
      </div>
    </main>
  )
}
