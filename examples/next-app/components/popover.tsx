import * as popover from "@zag-js/popover"
import { useMachine, normalizeProps, Portal } from "@zag-js/react"
import { useId } from "react"

interface Props {
  open: boolean
  defaultOpen?: boolean
  onOpenChange?: popover.Context["onOpenChange"]
}

export function Popover(props: Props) {
  const { open, defaultOpen, onOpenChange } = props

  const [state, send] = useMachine(popover.machine({ id: useId() }), {
    context: {
      __controlled: open !== undefined,
      open: Boolean(open ?? defaultOpen),
      onOpenChange: onOpenChange,
    },
  })

  const api = popover.connect(state, send, normalizeProps)

  return (
    <>
      <button {...api.triggerProps}>
        Click me
        <div {...api.indicatorProps}>{">"}</div>
      </button>

      <Portal>
        <div {...api.positionerProps}>
          <div {...api.contentProps}>
            <div {...api.arrowProps}>
              <div {...api.arrowTipProps} />
            </div>
            <div {...api.titleProps}>Popover Title</div>
            <div data-part="body">
              <a>Non-focusable Link</a>
              <a href="#">Focusable Link</a>
              <input placeholder="input" />
              <button {...api.closeTriggerProps}>X</button>
            </div>
          </div>
        </div>
      </Portal>
    </>
  )
}
