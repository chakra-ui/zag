import * as popover from "@zag-js/popover"
import { useMachine, normalizeProps, Portal } from "@zag-js/react"
import { useId } from "react"

interface Props extends Omit<popover.Props, "id"> {
  defaultOpen?: boolean
}

export function Popover(props: Props) {
  const { open, defaultOpen, ...context } = props

  const service = useMachine(popover.machine, {
    id: useId(),
    defaultOpen,
    open,
    ...context,
  })

  const api = popover.connect(service, normalizeProps)

  return (
    <>
      <button {...api.getTriggerProps()}>
        Click me
        <div {...api.getIndicatorProps()}>{">"}</div>
      </button>

      <Portal>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getArrowProps()}>
              <div {...api.getArrowTipProps()} />
            </div>
            <div {...api.getTitleProps()}>Popover Title</div>
            <div data-part="body">
              <a>Non-focusable Link</a>
              <a href="#">Focusable Link</a>
              <input placeholder="input" />
              <button {...api.getCloseTriggerProps()}>X</button>
            </div>
          </div>
        </div>
      </Portal>
    </>
  )
}
