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
        <button {...mergeProps(popoverApi.triggerProps, tooltipApi.triggerProps)}>Click me</button>

        {tooltipApi.open && (
          <div {...tooltipApi.positionerProps}>
            <div className="tooltip-content" {...tooltipApi.contentProps}>
              Tooltip
            </div>
          </div>
        )}

        <Portal>
          <div {...popoverApi.positionerProps}>
            <div {...popoverApi.contentProps}>
              <div {...popoverApi.titleProps}>Popover Title</div>
              <div data-part="body" data-testid="popover-body">
                <a>Non-focusable Link</a>
                <a href="#" data-testid="focusable-link">
                  Focusable Link
                </a>
                <input placeholder="input" />
                <button {...popoverApi.closeTriggerProps}>X</button>
              </div>
            </div>
          </div>
        </Portal>
      </div>
    </main>
  )
}
