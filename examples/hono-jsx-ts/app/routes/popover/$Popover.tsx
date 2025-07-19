import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine, Portal } from "@zag-js/hono-jsx"
import { useId, Fragment } from "hono/jsx"

interface PopoverProps extends Omit<popover.Props, "id"> {}

export default function Popover(props: PopoverProps) {
  const service = useMachine(popover.machine, {
    id: useId(),
    ...props,
  })

  const api = popover.connect(service, normalizeProps)

  const Wrapper = api.portalled ? Portal : Fragment

  return (
    <div>
      <button {...api.getTriggerProps()}>Click me</button>
      <Wrapper>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getArrowProps()}>
              <div {...api.getArrowTipProps()} />
            </div>

            <div>
              <div {...api.getTitleProps()}>
                <b>About Tabs</b>
              </div>
              <div {...api.getDescriptionProps()}>
                Tabs are used to organize and group content into sections that the user can navigate between.
              </div>
              <button>Action Button</button>
            </div>

            <button {...api.getCloseTriggerProps()}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" />
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </div>
      </Wrapper>
    </div>
  )
}
